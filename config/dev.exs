use Mix.Config

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with brunch.io to recompile .js and .css sources.
config :multiscan, Multiscan.Endpoint,
  url: [host: "padme.krampe.se", port: 1443],
  https: [port: 1443,
          otp_app: :multiscan,
          keyfile: System.get_env("MULTISCAN_SSL_KEY_PATH"),
          certfile: System.get_env("MULTISCAN_SSL_CERT_PATH"),
          cacertfile: System.get_env("MULTISCAN_CERTFILE_PATH")],
  debug_errors: true,
  code_reloader: true,
  cache_static_lookup: false,
  check_origin: false,
  watchers: [node: ["node_modules/brunch/bin/brunch", "watch", "--stdin"]]


# Watch static and templates for browser reloading.
config :multiscan, Multiscan.Endpoint,
  live_reload: [
    patterns: [
      ~r{priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$},
      ~r{web/views/.*(ex)$},
      ~r{web/templates/.*(eex)$}
    ]
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development.
# Do not configure such in production as keeping
# and calculating stacktraces is usually expensive.
config :phoenix, :stacktrace_depth, 20

# Configure your database
config :multiscan, Multiscan.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "multiscan_dev",
  hostname: "localhost",
  pool_size: 10
