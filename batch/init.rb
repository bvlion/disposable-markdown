require_relative '../lib/connection.rb'

create_query = <<-EOS
CREATE TABLE 投稿 (
  投稿タイトル VARCHAR(512) NOT NULL,
  内容 TEXT NOT NULL,
  URL用ハッシュ値_SHA1NOW CHAR(40) NOT NULL,
  閲覧用パスワード VARCHAR(128),
  削除・更新用パスワード VARCHAR(128) NOT NULL,
  登録日時 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (URL用ハッシュ値_SHA1NOW)
) ENGINE = INNODB;
EOS

# なかったら新規作成
client = get_connection
if client.query("show tables").count == 0 then
  client.query(create_query)
end

# ALTER TABLE 投稿 ADD OGP画像URL VARCHAR(512) AFTER URL用ハッシュ値_SHA1NOW;

client.close
