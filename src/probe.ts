/*
✨ CoonDev • https://dev.coonlink.com/

 ▄█▄    ████▄ ████▄    ▄   ██▄   ▄███▄      ▄
 █▀ ▄▀  █   █ █   █     █  █  █  █▀   ▀      █
 █   ▀  █   █ █   █ ██   █ █   █ ██▄▄   █     █
 █▄  ▄▀ ▀████ ▀████ █ █  █ █  █  █▄   ▄▀ █    █
 ▀███▀              █  █ █ ███▀  ▀███▀    █  █
                    █   ██                 █▐
                                           ▐
*/

export const PROBE_INSTANT_FRAGMENTS: readonly string[] = [
  '/.env', '/.git', '/.ssh', '/.aws', '/.kube', '/.secrets', '/.terraform',
  '/etc/passwd', '/etc/shadow', '/etc/boto.cfg', '/etc/apache2/',
  '/proc/self', '/bin/sh', '/bin/groovyconsole',
  '/root/.s3cfg', '/root/.boto',
  '/id_rsa', '/id_ed25519', '/id_dsa', '/id_rsa.pub',
  '/known_hosts', '/master.passwd',
  '/credentials.json', '/serviceaccountkey', '/service-account.json',
  '/firebase-service-account.json', '/google-service-account.json',
  '/terraform.tfstate', '/infra/terraform.tfstate',
  '/c99.php', '/r57.php', '/r57', '/b374k.php', '/wso.php', '/alfa.php',
  '/shell.php', '/shell.sh', '/cmd.aspx', '/cmd.jsp',
  '/wlwmanifest.xml',
  '/v1/sys/init', '/v1/acl/bootstrap',
  '/cosign.key', '/putty.reg',
  '/htpasswd', '/passwd',
];

export const PROBE_INSTANT_EXACT: ReadonlySet<string> = new Set(['/env']);

export const PROBE_HIGH_FRAGMENTS: readonly string[] = [
  '/.svn', '/.hg', '/.htpasswd', '/.htaccess', '/.docker', '/.npmrc',
  '/.vscode', '/.ds_store', '/.config', '/.local', '/.bash_history',
  '/.zsh_history', '/.mysql_history', '/.pgpass', '/.netrc', '/.ftpconfig',
  '/.idea', '/.dockerenv', '/.gitlab-ci', '/.github', '/.bashrc', '/.passwd',
  '/.profile', '/.rhosts', '/.sh_history', '/.subversion', '/.s3cfg',
  '/.cache', '/.amplifyrc', '/.boto', '/.sftp-config', '/.ftp-sync',
  '/.ftp-config', '/.astro/',
  '/.well-known/acme-challenge/index.php',
  '/wp-admin', '/wp-login', '/wp-config', '/wp-content',
  '/wp-includes', '/wp-json/wp/v2/users', '/wp-app', '/wp-atom',
  '/wp-blog-header', '/wp-comments', '/wp-cron', '/wp-dbmanager',
  '/wp-feed', '/wp-images', '/wp-links-opml', '/wp-load',
  '/wp-mail', '/wp-pass', '/wp-rdf', '/wp-register', '/wp-rss',
  '/wp-settings', '/wp-signup', '/wp-syntax', '/wp-trackback',
  '/wpau-backup', '/wpcallback', '/wpcontent', '/xmlrpc.php',
  '/phpmyadmin', '/pma/', '/adminer', '/phpinfo', '/info.php',
  '/phpinfo.php', '/phpinfos.php', '/phpldapadmin', '/phppgadmin',
  '/phpmyadmin2', '/myadmin', '/pgadmin', '/php.ini', '/php.php',
  '/php_info.php', '/php-info.php', '/infos.php', '/infophp.php',
  '/admin_phpinfo',
  '/cmd.php', '/up.php', '/list.jsp', '/about.php', '/eval',
  '/login_up.php', '/mail.php', '/test.php',
  '/actuator', '/telescope/', '/_debugbar/', '/server-status',
  '/server-info', '/trace.axd', '/elmah.axd', '/cgi-bin/', '/fcgi-bin',
  '/ecp/', '/owa/', '/h2-console', '/_ignition/health-check',
  '/hangfire', '/host-manager', '/web-console', '/__debug',
  '/opt/mailcow',
  '/credentials.txt', '/credentials.csv', '/credentials.ini', '/credentials.go',
  '/administrators.pwd', '/authors.pwd', '/service.pwd', '/users.pwd',
  '/config.php', '/config.yml', '/config.yaml', '/config.json',
  '/config.ts', '/config.rb', '/config.prod.ini', '/config.env',
  '/config/database.php', '/config/app.php', '/config/env.php',
  '/config/config.inc.php', '/config/parameters.yml',
  '/config/environment', '/config/module.config', '/configs/application.ini',
  '/database.yml', '/application.yml', '/settings.py', '/settings.json',
  '/settings.yaml', '/settings.ini', '/appsettings.',
  '/secrets.yml', '/secrets.yaml', '/conf.yaml', '/compose.yaml',
  '/circle.yml', '/docker-compose', '/dockerfile',
  '/docker-cloud.yml', '/insta-compose.yml',
  '/composer.json', '/composer.lock', '/package.json', '/package-lock',
  '/yarn.lock', '/gemfile', '/requirements.txt', '/pipfile',
  '/terraform.tfvars', '/serverless.yml', '/serverless.yaml', '/vercel.json',
  '/template.yaml', '/sam-template.yaml', '/amplify.yaml', '/amplify/',
  '/app.yml', '/app.yaml', '/app/serverless', '/app/netlify.toml',
  '/app/vercel.json', '/app/amplify', '/app/config/',
  '/app/etc/env.php', '/app/etc/local.xml',
  '/env.txt', '/env.js', '/env.yaml', '/env.rb', '/sendgrid.env',
  '/app.config.json', '/ftp-sync.json', '/ftp-config.json',
  '/constants.json', '/constants.yml', '/constants.ini',
  '/aws.yml', '/deploy.sh', '/config.js', '/stats.json',
  '/db_backup.sql', '/dump.sql', '/database.sql', '/database.sqlite',
  '/backup.sql', '/backup.zip', '/backup.tar.gz', '/backup.bak',
  '/db.sql', '/www.zip', '/site.zip',
  '/cpanel', '/administrator', '/solr/', '/jenkins', '/grafana',
  '/kibana', '/prometheus', '/elasticsearch', '/daloradius',
  '/dbadmin', '/dbman', '/jboss', '/jmx-console', '/axis2',
  '/axis2-admin', '/coldfusion', '/sql-admin', '/sqladmin',
  '/test-cgi', '/wizmysqladmin', '/printenv', '/showenv',
  '/dumpenv', '/dumpuser', '/hackme',
  '/meta-inf', '/web-inf', '/_vti_bin', '/_vti_pvt',
  '/_vti_adm', '/_vti_cnf', '/_vti_log', '/_vti_txt',
  '/global.asa', '/global.asax', '/crossdomain.xml',
  '/sap/public/info', '/sap/admin',
  '/sites/default/settings.php', '/configuration.php',
  '/login.action', '/laravel.log', '/storage/logs', '/akeeba.backend.log',
  '/mcp/transport', '/mcp/message',
  '/web.config', '/web.xml', '/frontpg.ini',
  '/vendor/', '/node_modules/', '/tmp/',
  '/package-updates/', '/var/task/', '/services/environments',
  '/remote/fgt_lang', '/admin/config', '/graphiql', '/graphql/console',
  '/servers/save.cgi', '/servers/link.cgi', '/server/config/', '/src/config/',
  '/dnscfg.cgi', '/sysinfo.cgi', '/software/update.cgi', '/software/install-updates',
  '/.cvs', '/.cvsignore', '/.forward', '/.history', '/.hta', '/.listing', '/.listings',
  '/access_log', '/error_log', '/exception_log', '/spamlog.log',
  '/development.log', '/production.log',
  '/tomcat', '/resin', '/resin-admin', '/struts', '/turbine', '/jrun',
  '/jmxsoapadapter', '/nagios', '/ganglia', '/directadmin', '/plesk-stat',
  '/hpwebjetadmin', '/iisadmin', '/weblogic', '/websphere',
  '/radmind', '/lotus_domino_admin', '/scgi-bin', '/cgi-bin2',
  '/_admin', '/_backup', '/_config', '/_private', '/_db_backups',
  '/admincp', '/adminpanel', '/adminsql', '/fileadmin', '/loginadmin',
  '/shopadmin', '/siteadmin', '/sshadmin', '/webadmin', '/openvpnadmin',
  '/super-admin', '/sys-admin', '/system-admin', '/sysadmin',
  '/ezsqliteadmin', '/dh_phpmyadmin', '/phpadmin', '/phpsqliteadmin',
  '/wbsadmin', '/vsadmin', '/vmailadmin', '/bbadmin', '/cmsadmin',
  '/newsadmin', '/navsiteadmin', '/newadmin', '/ur-admin', '/vadmind',
  '/~admin', '/~administrator', '/~sysadmin',
  '/dump', '/mysqldumper', '/vdsbackup', '/stackdump', '/autobackup', '/dmsdump',
  '/cosign.pub', '/putty', '/awstats.conf', '/ui_config.properties',
  '/manifest.mf', '/vite.config.js', '/vite.config.ts',
  '/webpack.manifest.json', '/npm-shrinkwrap.json', '/ws_ftp.log',
  '/server-inf', '/install.mysql', '/install.pgsql',
  '/debug', '/viewsource', '/remotetracer',
  '/privateassets', '/privatemsg', '/download_private',
];

export type ProbeClass = 'instant' | 'high' | null;

function buildFragmentRegex(fragments: readonly string[]): RegExp {
  const escaped = fragments.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(escaped.join('|'));
}

const INSTANT_RE = buildFragmentRegex(PROBE_INSTANT_FRAGMENTS);
const HIGH_RE    = buildFragmentRegex(PROBE_HIGH_FRAGMENTS);

const HIGH_PATTERN_RE: readonly RegExp[] = [
  /\/\.well-known\/[^/]+\.(php\d?|asp[x]?|jsp[x]?|cgi|pl|py|rb|sh)$/,
];

function normalizePath(pathname: string): string {
  try { return decodeURIComponent(pathname).toLowerCase(); }
  catch { return pathname.toLowerCase(); }
}

export function classifyProbe(pathname: string, search?: string): ProbeClass {
  const p = normalizePath(pathname);
  if (PROBE_INSTANT_EXACT.has(p)) return 'instant';
  if (/\.\.\//.test(p)) return 'instant';
  if (INSTANT_RE.test(p)) return 'instant';
  if (HIGH_RE.test(p)) return 'high';
  if (HIGH_PATTERN_RE.some(re => re.test(p))) return 'high';

  if (search) {
    const q = normalizePath(search);
    if (/\.\.\/|\.\.%2f|\.\.%5c/i.test(q)) return 'instant';
    if (INSTANT_RE.test(q)) return 'instant';
    if (HIGH_RE.test(q)) return 'high';
  }

  return null;
}

