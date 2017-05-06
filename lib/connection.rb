require 'mysql2'

# mysqlに接続
def get_connection
  # 接続情報
  host = "localhost"
  user = "root"
  pass = "root"
  schema = "disposable_markdown"

  # production(もっとスマートな方法あるかも…)
  if ENV["RACK_ENV"] == "production" then
    host = ENV["DB_HOST"]
    user = ENV["DB_USER"]
    pass = ENV["DB_PASS"]
    schema = ENV["SCHEMA"]
  end

  return Mysql2::Client.new(:host => host, :username => user, :password => pass, :database => schema)
end
