/*
✨ CoonDev • https://dev.coonlink.com/

 ▄█▄    ████▄ ████▄    ▄   ██▄   ▄███▄      ▄
 █▀ ▀▄  █   █ █   █     █  █  █  █▀   ▀      █
 █   ▀  █   █ █   █ ██   █ █   █ ██▄▄   █     █
 █▄  ▄▀ ▀████ ▀████ █ █  █ █  █  █▄   ▄▀ █    █
 ▀███▀              █  █ █ ███▀  ▀███▀    █  █
                    █   ██                 █▐
                                           ▐
*/

import { NextRequest, NextResponse } from "next/server"
import { normalizeIp } from "./ip.js"
import { isBanned, permBan } from "./ban.js"
import { isInChallenge, setChallenge } from "./challenge.js"
import type { GuardConfig } from "./types.js"

const ALWAYS_PASS = /^\/_next\/(static|image)|^\/favicon\.ico|^\/api\/_guard\//;

const PROBE_FRAGMENTS: readonly string[] = ['/.env', '/.git', '/.svn', '/.hg', '/.htpasswd', '/.htaccess','/.aws', '/.docker', '/.kube', '/.ssh', '/.npmrc', '/.secrets','/.terraform', '/.vscode', '/.DS_Store', '/.config', '/.local','/.bash_history', '/.zsh_history', '/.mysql_history', '/.pgpass','/.netrc', '/.ftpconfig', '/.idea', '/.dockerenv', '/.gitlab-ci','/.github', '/.bashrc', '/.passwd', '/.profile', '/.rhosts','/.sh_history', '/.subversion', '/.s3cfg', '/.cache', '/.amplifyrc','/.boto', '/.sftp-config', '/.ftp-sync', '/.ftp-config', '/.astro/','/wp-admin', '/wp-login', '/wp-config', '/wp-content','/wp-includes', '/wp-json/wp/v2/users', '/wp-app', '/wp-atom','/wp-blog-header', '/wp-comments', '/wp-cron', '/wp-dbmanager','/wp-feed', '/wp-images', '/wp-links-opml', '/wp-load','/wp-mail', '/wp-pass', '/wp-rdf', '/wp-register', '/wp-rss','/wp-settings', '/wp-signup', '/wp-syntax', '/wp-trackback','/wpau-backup', '/wpcallback', '/wpcontent', '/xmlrpc.php','/phpmyadmin', '/pma/', '/adminer', '/phpinfo', '/info.php','/phpinfo.php', '/phpinfos.php', '/phpldapadmin', '/phppgadmin','/phpMyAdmin2', '/myadmin', '/pgadmin', '/php.ini', '/php.php','/php_info.php', '/php-info.php', '/infos.php', '/infophp.php','/admin_phpinfo','/shell.php', '/shell.sh', '/cmd.php', '/cmd.aspx', '/cmd.jsp','/c99.php', '/r57.php', '/b374k.php', '/wso.php', '/alfa.php','/up.php', '/list.jsp', '/about.php', '/eval','/actuator', '/telescope/', '/_debugbar/', '/server-status','/server-info', '/trace.axd', '/elmah.axd', '/cgi-bin/', '/fcgi-bin','/ecp/', '/owa/', '/h2-console', '/_ignition/health-check','/hangfire', '/host-manager', '/web-console', '/__debug','/etc/passwd', '/etc/shadow', '/etc/boto.cfg', '/etc/apache2/','/proc/self', '/bin/sh', '/bin/groovyconsole','/root/.s3cfg', '/root/.boto', '/opt/mailcow','/credentials.json', '/serviceAccountKey', '/service-account.json','/secrets.json', '/firebase-service-account.json', '/google-service-account.json','/credentials.txt', '/credentials.csv', '/credentials.ini', '/credentials.go','/id_rsa', '/id_ed25519', '/id_dsa', '/id_rsa.pub','/known_hosts', '/master.passwd', '/administrators.pwd','/authors.pwd', '/service.pwd', '/users.pwd','/config.php', '/config.yml', '/config.yaml', '/config.json','/config.ts', '/config.rb', '/config.prod.ini', '/config.env','/config/database.php', '/config/app.php', '/config/env.php','/config/config.inc.php', '/config/parameters.yml','/config/environment', '/config/module.config','/configs/application.ini','/database.yml', '/application.yml', '/settings.py', '/settings.json','/settings.yaml', '/settings.ini', '/appsettings.','/secrets.yml', '/secrets.yaml','/conf.yaml', '/compose.yaml', '/circle.yml','/docker-compose', '/Dockerfile', '/docker-cloud.yml', '/insta-compose.yml','/composer.json', '/composer.lock', '/package.json', '/package-lock','/yarn.lock', '/Gemfile', '/requirements.txt', '/Pipfile','/terraform.tfstate', '/infra/terraform.tfstate', '/terraform.tfvars','/serverless.yml', '/serverless.yaml', '/vercel.json','/template.yaml', '/sam-template.yaml', '/amplify.yaml', '/amplify/','/app.yml', '/app.yaml', '/app/serverless', '/app/netlify.toml','/app/vercel.json', '/app/amplify', '/app/config/','/app/etc/env.php', '/app/etc/local.xml','/.well-known/openid-configuration', '/.well-known/jwks','/.well-known/acme-challenge/index.php','/env.txt', '/env.js', '/env.yaml', '/env.rb', '/sendgrid.env','/app.config.json', '/ftp-sync.json', '/ftp-config.json','/constants.json', '/constants.yml', '/constants.ini','/db_backup.sql', '/dump.sql', '/database.sql', '/database.sqlite','/backup.sql', '/backup.zip', '/backup.tar.gz', '/backup.bak','/db.sql', '/www.zip', '/site.zip','/cpanel', '/administrator', '/solr/', '/jenkins', '/grafana','/kibana', '/prometheus', '/elasticsearch', '/daloradius','/dbadmin', '/dbman', '/jboss', '/jmx-console', '/axis2','/axis2-admin', '/coldfusion', '/sql-admin', '/sqladmin','/test-cgi', '/wizmysqladmin', '/printenv', '/showenv','/dumpenv', '/dumpuser', '/hackme','/META-INF', '/WEB-INF', '/_vti_bin', '/_vti_pvt','/_vti_adm', '/_vti_cnf', '/_vti_log', '/_vti_txt','/global.asa', '/global.asax', '/crossdomain.xml','/sap/public/info', '/sap/admin','/v1/sys/init', '/v1/acl/bootstrap','/sites/default/settings.php', '/configuration.php','/login.action', '/login_up.php', '/mail.php', '/test.php','/laravel.log', '/storage/logs', '/akeeba.backend.log','/mcp/transport', '/mcp/message','/web.config', '/web.xml', '/frontpg.ini','/stats.json', '/config.js','/vendor/', '/node_modules/', '/storage/logs', '/tmp/','/package-updates/', '/var/task/', '/services/environments','/aws.yml', '/deploy.sh', '/remote/fgt_lang','/admin/config', '/graphiql', '/graphql/console','/servers/save.cgi', '/servers/link.cgi','/server/config/', '/src/config/','/dnscfg.cgi', '/sysinfo.cgi','/software/update.cgi', '/software/install-updates',];

const PROBE_EXACT = new Set(['/env']);

const PROBE_REGEX = /\.\.\//;

function isProbe(pathname: string): boolean {
  if (PROBE_EXACT.has(pathname)) return true;
  if (PROBE_REGEX.test(pathname)) return true;
  for (const fragment of PROBE_FRAGMENTS) {
    if (pathname.includes(fragment)) return true;
  }
  return false;
}

export function createMiddleware(config: GuardConfig) {
  const allowed = new Set((config.allowedIps ?? []).map(normalizeIp));

  async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    if (ALWAYS_PASS.test(pathname)) return NextResponse.next();

    const rawIp =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
    const ip = normalizeIp(rawIp);

    if (allowed.has(ip)) return NextResponse.next();

    if (await isBanned(ip, config.store)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (isProbe(pathname)) {
      if (config.challengeMode) {
        if (await isInChallenge(ip, config.store)) {
          await permBan(ip, `Probe while challenged: ${pathname}`, config, 'probe');
          return new NextResponse('Forbidden', { status: 403 });
        }
        await setChallenge(ip, config.store);
        const dest = new URL(config.challengeUrl ?? '/guard-challenge', request.url);
        return NextResponse.redirect(dest, 302);
      }
      await permBan(ip, `Instant ban: probe path ${pathname}`, config, 'probe');
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.next();
  }

  const config_ = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  };

  return { middleware, config: config_ };
}
