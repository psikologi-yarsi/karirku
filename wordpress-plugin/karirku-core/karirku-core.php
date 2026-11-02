<?php
/**
 * Plugin Name: KarirKu Core
 * Description: Core data collection, participant identity separation, and research dashboard for KarirKu.
 * Version: 0.1.0
 * Author: Fakultas Psikologi Universitas YARSI
 * Requires at least: 6.2
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) { exit; }

final class KarirKu_Core {
    const VERSION = '0.1.0';
    const OPTION = 'karirku_core_settings';
    const DB_VERSION_OPTION = 'karirku_core_db_version';
    const REST_NS = 'karirku/v1';

    public static function init() {
        register_activation_hook(__FILE__, array(__CLASS__, 'activate'));
        add_action('plugins_loaded', array(__CLASS__, 'maybe_upgrade'));
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
        add_action('admin_menu', array(__CLASS__, 'admin_menu'));
        add_action('admin_init', array(__CLASS__, 'register_settings'));
        add_shortcode('karirku_app', array(__CLASS__, 'app_shortcode'));
        add_filter('allowed_http_origin', array(__CLASS__, 'allow_app_origin'));
    }

    public static function tables() {
        global $wpdb;
        return array(
            'participants' => $wpdb->prefix . 'karirku_participants',
            'identities' => $wpdb->prefix . 'karirku_identities',
            'instruments' => $wpdb->prefix . 'karirku_instruments',
            'submissions' => $wpdb->prefix . 'karirku_submissions',
        );
    }

    public static function activate() {
        self::create_tables();
        update_option(self::DB_VERSION_OPTION, self::VERSION);
    }

    public static function maybe_upgrade() {
        if (get_option(self::DB_VERSION_OPTION) !== self::VERSION) {
            self::create_tables();
            update_option(self::DB_VERSION_OPTION, self::VERSION);
        }
    }

    private static function create_tables() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $t = self::tables();
        $collate = $wpdb->get_charset_collate();

        $sql_participants = "CREATE TABLE {$t['participants']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            participant_code VARCHAR(32) NOT NULL,
            created_at DATETIME NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            PRIMARY KEY  (id),
            UNIQUE KEY participant_code (participant_code)
        ) $collate;";

        $sql_identities = "CREATE TABLE {$t['identities']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            participant_id BIGINT UNSIGNED NOT NULL,
            full_name VARCHAR(190) NULL,
            email VARCHAR(190) NULL,
            identity_note TEXT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY participant_id (participant_id),
            KEY email (email)
        ) $collate;";

        $sql_instruments = "CREATE TABLE {$t['instruments']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            instrument_slug VARCHAR(100) NOT NULL,
            instrument_name VARCHAR(190) NOT NULL,
            version_label VARCHAR(50) NOT NULL DEFAULT '1.0',
            description TEXT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY instrument_slug (instrument_slug)
        ) $collate;";

        $sql_submissions = "CREATE TABLE {$t['submissions']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            submission_uuid CHAR(36) NOT NULL,
            participant_id BIGINT UNSIGNED NOT NULL,
            instrument_id BIGINT UNSIGNED NOT NULL,
            instrument_version VARCHAR(50) NOT NULL,
            submitted_at DATETIME NOT NULL,
            started_at DATETIME NULL,
            duration_seconds INT UNSIGNED NULL,
            consent_given TINYINT(1) NOT NULL DEFAULT 0,
            consent_version VARCHAR(50) NULL,
            consented_at DATETIME NULL,
            demographics LONGTEXT NULL,
            responses LONGTEXT NULL,
            scores LONGTEXT NULL,
            result_summary LONGTEXT NULL,
            feedback LONGTEXT NULL,
            sync_status VARCHAR(20) NOT NULL DEFAULT 'pending',
            sync_message TEXT NULL,
            source_origin VARCHAR(255) NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY submission_uuid (submission_uuid),
            KEY participant_id (participant_id),
            KEY instrument_id (instrument_id),
            KEY submitted_at (submitted_at),
            KEY sync_status (sync_status)
        ) $collate;";

        dbDelta($sql_participants);
        dbDelta($sql_identities);
        dbDelta($sql_instruments);
        dbDelta($sql_submissions);

        $wpdb->insert($t['instruments'], array(
            'instrument_slug' => 'riasec',
            'instrument_name' => 'KarirKu RIASEC',
            'version_label' => '1.0',
            'description' => 'Instrumen minat karier RIASEC 42 item.',
            'is_active' => 1,
            'created_at' => current_time('mysql'),
        ), array('%s','%s','%s','%s','%d','%s'));
    }

    public static function settings() {
        $defaults = array('app_url' => '', 'apps_script_url' => '', 'apps_script_secret' => '');
        return wp_parse_args(get_option(self::OPTION, array()), $defaults);
    }

    public static function allow_app_origin($origin) {
        $settings = self::settings();
        $app_url = trim($settings['app_url']);
        if (!$origin || !$app_url) { return $origin; }
        $app_origin = untrailingslashit((string) wp_parse_url($app_url, PHP_URL_SCHEME)) . '://' .
            (string) wp_parse_url($app_url, PHP_URL_HOST);
        $app_port = wp_parse_url($app_url, PHP_URL_PORT);
        if ($app_port) { $app_origin .= ':' . (int) $app_port; }
        return untrailingslashit($origin) === untrailingslashit($app_origin) ? $origin : $origin;
    }

    public static function register_routes() {
        register_rest_route(self::REST_NS, '/submission', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'receive_submission'),
            'permission_callback' => '__return_true',
        ));
        register_rest_route(self::REST_NS, '/health', array(
            'methods' => 'GET',
            'callback' => function() { return rest_ensure_response(array('ok' => true, 'version' => self::VERSION)); },
            'permission_callback' => '__return_true',
        ));
    }

    private static function json_field($value) {
        return wp_json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private static function valid_object($value) {
        return is_array($value) || is_object($value);
    }

    private static function rate_limited() {
        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
        $key = 'karirku_rl_' . md5($ip);
        $count = (int) get_transient($key);
        if ($count >= 20) { return true; }
        set_transient($key, $count + 1, HOUR_IN_SECONDS);
        return false;
    }

    public static function receive_submission(WP_REST_Request $request) {
        global $wpdb;
        if (self::rate_limited()) {
            return new WP_Error('karirku_rate_limit', 'Terlalu banyak pengiriman. Coba kembali nanti.', array('status' => 429));
        }

        $data = $request->get_json_params();
        if (!is_array($data)) {
            return new WP_Error('karirku_invalid_json', 'Payload JSON tidak valid.', array('status' => 400));
        }
        if (empty($data['consent']['given'])) {
            return new WP_Error('karirku_consent_required', 'Persetujuan partisipan wajib tercatat.', array('status' => 400));
        }

        $slug = sanitize_key($data['instrument_slug'] ?? 'riasec');
        $t = self::tables();
        $instrument = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$t['instruments']} WHERE instrument_slug = %s AND is_active = 1",
            $slug
        ));
        if (!$instrument) {
            return new WP_Error('karirku_unknown_instrument', 'Instrumen tidak terdaftar atau tidak aktif.', array('status' => 400));
        }

        $demographics = $data['demographics'] ?? array();
        $responses = $data['responses'] ?? array();
        $scores = $data['scores'] ?? array();
        $result = $data['result'] ?? array();
        $feedback = $data['feedback'] ?? array();
        if (!self::valid_object($demographics) || !self::valid_object($responses) ||
            !self::valid_object($scores) || !self::valid_object($result) || !self::valid_object($feedback)) {
            return new WP_Error('karirku_invalid_payload', 'Struktur data pengisian tidak lengkap.', array('status' => 400));
        }
        if (strlen(self::json_field($data)) > 180000) {
            return new WP_Error('karirku_payload_too_large', 'Ukuran data melebihi batas.', array('status' => 413));
        }

        $participant_code = 'KK-' . strtoupper(wp_generate_password(8, false, false));
        $now = current_time('mysql');
        $wpdb->insert($t['participants'], array('participant_code' => $participant_code, 'created_at' => $now), array('%s','%s'));
        if (!$wpdb->insert_id) {
            return new WP_Error('karirku_participant_error', 'Tidak dapat membuat kode partisipan.', array('status' => 500));
        }
        $participant_id = (int) $wpdb->insert_id;

        // Identitas pribadi disimpan pada tabel terpisah, tidak dimasukkan ke data respons penelitian.
        $identity = $data['identity'] ?? array();
        if (self::valid_object($identity)) {
            $name = sanitize_text_field($identity['full_name'] ?? '');
            $email = sanitize_email($identity['email'] ?? '');
            if ($name !== '' || $email !== '') {
                $wpdb->insert($t['identities'], array(
                    'participant_id' => $participant_id,
                    'full_name' => $name ?: null,
                    'email' => $email ?: null,
                    'identity_note' => '',
                    'created_at' => $now,
                    'updated_at' => $now,
                ), array('%d','%s','%s','%s','%s','%s'));
            }
        }

        $uuid = wp_generate_uuid4();
        $consent = $data['consent'];
        $started = sanitize_text_field($data['started_at'] ?? '');
        $started_mysql = $started ? gmdate('Y-m-d H:i:s', strtotime($started)) : null;
        $duration = isset($data['duration_seconds']) ? max(0, min(86400, absint($data['duration_seconds']))) : null;
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';

        $wpdb->insert($t['submissions'], array(
            'submission_uuid' => $uuid,
            'participant_id' => $participant_id,
            'instrument_id' => (int) $instrument->id,
            'instrument_version' => sanitize_text_field($data['instrument_version'] ?? $instrument->version_label),
            'submitted_at' => $now,
            'started_at' => $started_mysql,
            'duration_seconds' => $duration,
            'consent_given' => 1,
            'consent_version' => sanitize_text_field($consent['version'] ?? '1.0'),
            'consented_at' => $now,
            'demographics' => self::json_field($demographics),
            'responses' => self::json_field($responses),
            'scores' => self::json_field($scores),
            'result_summary' => self::json_field($result),
            'feedback' => self::json_field($feedback),
            'sync_status' => 'pending',
            'source_origin' => $origin,
        ));
        if (!$wpdb->insert_id) {
            return new WP_Error('karirku_submission_error', 'Data pengisian tidak berhasil disimpan.', array('status' => 500));
        }

        $submission_id = (int) $wpdb->insert_id;
        self::sync_to_apps_script($submission_id, $participant_code, $instrument, $data, $uuid);

        return rest_ensure_response(array(
            'success' => true,
            'participant_code' => $participant_code,
            'submission_id' => $uuid,
            'message' => 'Data berhasil diterima.',
        ));
    }

    private static function sync_to_apps_script($submission_id, $participant_code, $instrument, $data, $uuid) {
        $settings = self::settings();
        if (empty($settings['apps_script_url'])) { return; }
        $payload = array(
            'secret' => $settings['apps_script_secret'],
            'action' => 'saveKarirKuSubmission',
            'submission_id' => $uuid,
            'participant_code' => $participant_code,
            'instrument_slug' => $instrument->instrument_slug,
            'instrument_name' => $instrument->instrument_name,
            'instrument_version' => sanitize_text_field($data['instrument_version'] ?? $instrument->version_label),
            'submitted_at' => current_time('mysql'),
            'demographics' => $data['demographics'] ?? array(),
            'responses' => $data['responses'] ?? array(),
            'scores' => $data['scores'] ?? array(),
            'result' => $data['result'] ?? array(),
            'consent' => array('given' => true, 'version' => $data['consent']['version'] ?? '1.0'),
            'feedback' => $data['feedback'] ?? array(),
            'duration_seconds' => absint($data['duration_seconds'] ?? 0),
        );
        $response = wp_remote_post(esc_url_raw($settings['apps_script_url']), array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json; charset=utf-8'),
            'body' => self::json_field($payload),
        ));
        global $wpdb;
        $t = self::tables();
        if (is_wp_error($response)) {
            $wpdb->update($t['submissions'], array('sync_status' => 'error', 'sync_message' => $response->get_error_message()), array('id' => $submission_id));
            return;
        }
        $code = (int) wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        $ok = $code >= 200 && $code < 300 && !empty($body['success']);
        $wpdb->update($t['submissions'], array(
            'sync_status' => $ok ? 'synced' : 'error',
            'sync_message' => $ok ? null : sanitize_textarea_field($body['message'] ?? ('HTTP ' . $code)),
        ), array('id' => $submission_id));
    }

    public static function app_shortcode($atts) {
        $settings = self::settings();
        $url = trim($settings['app_url']);
        if (!$url) {
            return current_user_can('manage_options')
                ? '<p>KarirKu: isi URL aplikasi pada Settings → KarirKu.</p>'
                : '';
        }
        $atts = shortcode_atts(array('height' => '900', 'title' => 'KarirKu'), $atts, 'karirku_app');
        $url = add_query_arg('karirku_api', rawurlencode(rest_url(self::REST_NS . '/submission')), $url);
        return '<iframe title="' . esc_attr($atts['title']) . '" src="' . esc_url($url) . '" style="width:100%;height:' . absint($atts['height']) . 'px;border:0;display:block" loading="lazy" allow="clipboard-write"></iframe>';
    }

    public static function admin_menu() {
        add_menu_page('KarirKu', 'KarirKu', 'manage_options', 'karirku-core', array(__CLASS__, 'render_dashboard'), 'dashicons-chart-area', 58);
        add_submenu_page('karirku-core', 'Pengaturan KarirKu', 'Pengaturan', 'manage_options', 'karirku-settings', array(__CLASS__, 'render_settings'));
        add_submenu_page('karirku-core', 'Identitas Partisipan', 'Identitas Partisipan', 'manage_options', 'karirku-identities', array(__CLASS__, 'render_identities'));
    }

    public static function register_settings() {
        register_setting('karirku_core_group', self::OPTION, array(__CLASS__, 'sanitize_settings'));
    }

    public static function sanitize_settings($input) {
        return array(
            'app_url' => esc_url_raw($input['app_url'] ?? ''),
            'apps_script_url' => esc_url_raw($input['apps_script_url'] ?? ''),
            'apps_script_secret' => sanitize_text_field($input['apps_script_secret'] ?? ''),
        );
    }

    public static function render_settings() {
        if (!current_user_can('manage_options')) { return; }
        $s = self::settings();
        ?>
        <div class="wrap"><h1>Pengaturan KarirKu Core</h1>
        <form method="post" action="options.php">
            <?php settings_fields('karirku_core_group'); ?>
            <table class="form-table">
                <tr><th><label for="kk-app-url">URL aplikasi frontend</label></th><td><input class="regular-text" type="url" id="kk-app-url" name="<?php echo esc_attr(self::OPTION); ?>[app_url]" value="<?php echo esc_attr($s['app_url']); ?>"><p class="description">URL GitHub Pages atau URL frontend KarirKu.</p></td></tr>
                <tr><th><label for="kk-apps-url">Google Apps Script Web App URL</label></th><td><input class="regular-text" type="url" id="kk-apps-url" name="<?php echo esc_attr(self::OPTION); ?>[apps_script_url]" value="<?php echo esc_attr($s['apps_script_url']); ?>"></td></tr>
                <tr><th><label for="kk-secret">Apps Script shared secret</label></th><td><input class="regular-text" type="password" autocomplete="new-password" id="kk-secret" name="<?php echo esc_attr(self::OPTION); ?>[apps_script_secret]" value="<?php echo esc_attr($s['apps_script_secret']); ?>"><p class="description">Rahasia ini hanya digunakan server WordPress; jangan ditanam dalam JavaScript frontend.</p></td></tr>
            </table><?php submit_button(); ?>
        </form>
        <h2>Shortcode</h2><code>[karirku_app height="950"]</code>
        <h2>REST API</h2><code><?php echo esc_html(rest_url(self::REST_NS . '/submission')); ?></code>
        </div>
        <?php
    }

    public static function render_dashboard() {
        if (!current_user_can('manage_options')) { return; }
        global $wpdb;
        $t = self::tables();
        $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$t['submissions']}");
        $participants = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$t['participants']}");
        $pending = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$t['submissions']} WHERE sync_status IN ('pending','error')");
        $rows = $wpdb->get_results("SELECT s.*, p.participant_code, i.instrument_name FROM {$t['submissions']} s JOIN {$t['participants']} p ON p.id=s.participant_id JOIN {$t['instruments']} i ON i.id=s.instrument_id ORDER BY s.id DESC LIMIT 100");
        echo '<div class="wrap"><h1>KarirKu — Dashboard Penelitian</h1>';
        echo '<p><strong>Total pengisian:</strong> ' . esc_html($total) . ' &nbsp; <strong>Kode partisipan:</strong> ' . esc_html($participants) . ' &nbsp; <strong>Perlu sinkronisasi:</strong> ' . esc_html($pending) . '</p>';
        echo '<p>Data identitas tidak ditampilkan pada tabel ini dan disimpan terpisah.</p>';
        echo '<table class="widefat striped"><thead><tr><th>Tanggal</th><th>Kode partisipan</th><th>Instrumen</th><th>Versi</th><th>Durasi (detik)</th><th>Persetujuan</th><th>Sinkronisasi Sheets</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            echo '<tr><td>' . esc_html($r->submitted_at) . '</td><td>' . esc_html($r->participant_code) . '</td><td>' . esc_html($r->instrument_name) . '</td><td>' . esc_html($r->instrument_version) . '</td><td>' . esc_html($r->duration_seconds) . '</td><td>' . ($r->consent_given ? 'Ya' : 'Tidak') . '</td><td>' . esc_html($r->sync_status) . '</td></tr>';
        }
        if (!$rows) { echo '<tr><td colspan="7">Belum ada data pengisian.</td></tr>'; }
        echo '</tbody></table></div>';
    }

    public static function render_identities() {
        if (!current_user_can('manage_options')) { return; }
        global $wpdb;
        $t = self::tables();
        $rows = $wpdb->get_results("SELECT p.participant_code, x.full_name, x.email, x.created_at FROM {$t['identities']} x JOIN {$t['participants']} p ON p.id=x.participant_id ORDER BY x.id DESC LIMIT 200");
        echo '<div class="wrap"><h1>Identitas Partisipan</h1><p><strong>Akses terbatas.</strong> Halaman ini menampilkan data identitas yang dipisahkan dari respons penelitian. Pastikan dasar etik, tujuan, dan masa retensi data sudah ditetapkan.</p>';
        echo '<table class="widefat striped"><thead><tr><th>Kode partisipan</th><th>Nama</th><th>Email</th><th>Dicatat</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            echo '<tr><td>' . esc_html($r->participant_code) . '</td><td>' . esc_html($r->full_name) . '</td><td>' . esc_html($r->email) . '</td><td>' . esc_html($r->created_at) . '</td></tr>';
        }
        if (!$rows) { echo '<tr><td colspan="4">Belum ada data identitas.</td></tr>'; }
        echo '</tbody></table></div>';
    }
}

KarirKu_Core::init();
