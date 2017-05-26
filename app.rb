require 'sinatra'
require_relative 'lib/connection.rb'
require 'digest/sha1'
require 'json'
require 'net/https'

set :erb, :escape_html => true
use Rack::SslEnforcer if production?

$dir = "20170517"

# トップ
get '/' do
  @title = "使い捨てマークダウン"
  @description = "当サイトは、Markdownを使い捨てで登録していただけるサイトです。"
  erb :index
end

# Q&A
get '/qa' do
  @title = "Q & A"
  @description = "使い捨てマークダウンのQ&Aとなります。"
  erb :qa
end

# サイトマップ
get '/sitemap' do
  @title = "サイトマップ"
  @description = "使い捨てマークダウンのサイトマップとなります。"
  erb :sitemap
end

# 利用規約
get '/rule' do
  @title = "利用規約"
  @description = "使い捨てマークダウンの利用規約となります。"
  erb :rule
end

# プライバシー
get '/privacy' do
  @title = "プライバシーポリシー"
  @description = "使い捨てマークダウンのプライバシーポリシーとなります。"
  erb :privacy
end

# 表示
get '/view/?:hash?' do |hash|
  if hash.nil? then
    halt 404
  end

  client = get_connection
  stmt = client.prepare("SELECT 投稿タイトル, 内容, 閲覧用パスワード FROM 投稿 WHERE URL用ハッシュ値_SHA1NOW = ?")
  result = stmt.execute(hash)

  if result.count == 0 then
    halt 404
  end

  @markdown = ""
  @title = "閲覧に認証が必要です。"
  @description = "閲覧に認証が必要な記事です。"
  @hash = hash
  result.each do |e1|
      if e1["閲覧用パスワード"].empty? then
        @markdown = e1["内容"]
        @title = e1["投稿タイトル"]
        @description = e1["内容"].partition("\n")[0]
      end
  end

  client.close

  @js = "view.js"
  erb :view
end

# パスワード認証用API
get '/viewauth/:hash' do |hash|
  if hash.nil? then
    halt 404
  end

  pass = "#{params[:pass]}"

  client = get_connection
  stmt = client.prepare("SELECT 投稿タイトル, 内容 FROM 投稿 WHERE URL用ハッシュ値_SHA1NOW = ? AND 閲覧用パスワード = ?")
  result = stmt.execute(hash, pass)

  if result.count == 0 then
    data = {error: "パスワードが一致しません。"}
  else
    result.each do |e1|
      data = {markdown: e1["内容"], title: e1["投稿タイトル"]}
    end
  end
  client.close
  data.to_json
end

# 登録・更新画面
get '/edit/?:hash?' do |hash|
  @markdown = "## ここにMarkdownを記載してください。\n黄色のエリアで動的にMarkdownが生成されます。"
  @title = "新規投稿"
  @hash_value = ""
  @description = "こちらから新規でMarkdownの記事をご記載頂けます。"

  if !hash.nil? then
    client = get_connection
    stmt = client.prepare("SELECT 投稿タイトル, 内容 FROM 投稿 WHERE URL用ハッシュ値_SHA1NOW = ?")
    result = stmt.execute(hash)
    if result.count == 0 then
      halt 404
    end
    result.each do |e1|
        @title = e1["投稿タイトル"]
        @description = e1["内容"].partition("\n")[0]
    end
    @hash_value = hash
    client.close
  end

  @js = "editor.js"
  erb :edit
end

# 登録・更新API
post '/regist' do
  title = "#{params[:title]}"
  markdown = "#{params[:markdown]}"
  edit_pass = "#{params[:edit_pass]}"
  view_pass = "#{params[:view_pass]}"
  hash = "#{params[:hash]}"

  client = get_connection
  if hash.empty? then
    insert_query = <<-EOS
      INSERT INTO 投稿
        (投稿タイトル, 内容, 閲覧用パスワード, 削除・更新用パスワード, URL用ハッシュ値_SHA1NOW)
      VALUES
        (?, ?, ?, ?, ?)
    EOS
    hash = Digest::SHA1.hexdigest(Time.now.strftime("%Y%m%d%H%M%S"))
    stmt = client.prepare(insert_query)
    result = stmt.execute(title, markdown, view_pass, edit_pass, hash)
  else
    update_query = <<-EOS
      UPDATE 投稿 SET
        投稿タイトル = ?,
        内容 = ?,
        閲覧用パスワード = ?,
        削除・更新用パスワード = ?
      WHERE
        URL用ハッシュ値_SHA1NOW = ?
    EOS
    stmt = client.prepare(update_query)
    result = stmt.execute(title, markdown, view_pass, edit_pass, hash)
  end

  if result == 0 then
    data = {message: ""}
  else
    data = {message: "編集用URLは<br><b>https://disposable-markdown.herokuapp.com/edit/" + hash + "</b><br>となります。<br>紛失した場合、再発行はできませんのでご注意ください。<br><br>これから表示用URLに遷移します。", hash: hash}
  end
  client.close
  data.to_json
end

# 削除API
put '/delete/:hash' do |hash|
  client = get_connection
  if hash.empty? then
    data = {error: "不正なアクセスの可能性があります。"}
  else
    stmt = client.prepare("DELETE FROM 投稿 WHERE URL用ハッシュ値_SHA1NOW = ?")
    result = stmt.execute(hash)
    if result == 0 then
      data = {error: "既に削除されている可能性があります。"}
    else
      data = {error: ""}
    end
  end
  client.close
  data.to_json
end

# 編集表示API
get '/editauth/:hash' do |hash|
  pass = "#{params[:pass]}"

  client = get_connection
  stmt = client.prepare("SELECT 内容, 閲覧用パスワード FROM 投稿 WHERE URL用ハッシュ値_SHA1NOW = ? AND 削除・更新用パスワード = ?")
  result = stmt.execute(hash, pass)

  if result.count == 0 then
    data = {error: "パスワードが一致しません。"}
  else
    result.each do |e1|
      data = {markdown: e1["内容"], edit_pass: e1["閲覧用パスワード"]}
    end
  end
  client.close
  data.to_json
end

# お問い合わせ
post '/inquiry_post' do
    uri = URI.parse("https://bvlion-app.appspot.com/inquiry_post/")
    http = Net::HTTP.new(uri.host, uri.port)

    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    req = Net::HTTP::Post.new(uri.path)
    req.set_form_data({'title' => "#{params[:mail]}", 'comment' => "#{params[:comment]}"})

    res = http.request(req)
    res.body
end

# JSオフ
get '/noscript' do
  erb :noscript, :layout => :noscript_layout
end

# 404
not_found do
  @title = "404 not found!"
  erb :notfound
end

# error
error do
  @title = "500 Internal Server Error"
  erb :error
end
