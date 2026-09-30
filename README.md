# qiita-articles

複数の技術プロジェクトの記事を管理するリポジトリです。記事本文の正本はこのリポジトリのMarkdownです。対象プロジェクトの実装や技術仕様は、それぞれのGitHubリポジトリを正本として確認します。

## 構成

| パス | 用途 |
| --- | --- |
| `public/*.md` | Qiita CLI形式の記事。1ファイルにつき1記事 |
| `scripts/new-article.cjs` | 公式CLIで記事を生成し、投稿対象外の下書きにする |
| `qiita.config.json` | localhost:8888、限定共有記事の取得は無効 |
| `package.json` / `package-lock.json` | 公式CLI 1.10.0と依存関係を固定 |
| `.github/workflows/check.yml` | Secret不要のインストール・CLI動作確認 |
| `.github/workflows/publish.yml` | mainからQiitaへ投稿・更新し、記事ID等をGitHubへ戻す |

Node.js 22.22.1以上とnpmが必要です。ワークフローはNode.js 22.23.2を使用します。初期化は公式の `npx qiita init` で実施し、公開ゲートとSecret確認を追加しました。記事本文はまだありません。

## ローカルでの執筆

```sh
git clone https://github.com/sosboy-san/qiita-articles.git
cd qiita-articles
npm ci
npm run qiita:version
npm run new -- gmail-pop-end-gmail-bridge
npm run preview
```

`npm run new` は公式 `qiita new` を実行した後、`ignorePublish: true` に変更します。公式 `npx qiita new` を直接使う場合は、生成直後にこの値をtrueにしてください。下書きは公開ゲート有効時も投稿されません。ただしPublicリポジトリにpushした下書き自体は誰でも閲覧できます。

認証が必要なローカル操作は、本人が自分の端末で `npx qiita login` を実行してください。トークンは通常ユーザーの設定ディレクトリに保存されます。チャットやコマンド引数、リポジトリ内へ入力しないでください。プレビューには記事取得処理が含まれるため、起動前後でgit diffを確認してください。

## Qiitaトークンの登録

1. 本人が https://qiita.com/settings/tokens/new で `read_qiita` と `write_qiita` 権限のトークンを作成します。
2. https://github.com/sosboy-san/qiita-articles/settings/secrets/actions の「New repository secret」で、名前 `QIITA_TOKEN` として登録します。
3. 登録完了したことだけをこのWorkへ伝えてください。値は伝えないでください。
4. 登録確認後、公開フローの確認を進めます。初期状態では公開は無効です。

トークンはコード、commit、ログ、README、スクリーンショットへ保存しません。`.gitignore` で環境ファイル・認証ファイル等を除外しますが、本文に貼った秘密情報は防げないのでcommit前に差分を確認します。

## 公開・更新フロー

初期状態はRepository variable `QIITA_PUBLISH_ENABLED` が未設定なので、公開ジョブはスキップされます。トークン登録の確認後、公開開始が決まった時点で Settings → Secrets and variables → Actions → Variables に `QIITA_PUBLISH_ENABLED` を値 `true` で登録します。この変数はSecretではありません。

1. `git pull --ff-only` でActionsが戻した最新の記事ID・更新日時を取得します。
2. 記事のタイトル、タグ、本文、参照情報、秘密情報の混入を確認します。
3. 公開する記事だけ `ignorePublish: false` にします。`private: false` は公開記事、`private: true` は限定共有記事であり、下書きではありません。
4. commit・push、またはPRをmainへマージします。
5. Actionsが公式 `increments/qiita-cli/actions/publish@v1.10.0` の `publish --all` を実行します。全記事のうち投稿対象の記事を反映します。
6. 公式Actionが記事ID・更新日時などをcommit・pushします。Actions成功とQiita表示を確認し、ローカルを再度pullします。

mainのpushと手動実行に対応しています。main以外の手動実行は公開しません。Secret未登録なら公開前に失敗し、記事ファイルがなければ公式公開Actionを実行しません。書き込み権限は公開ジョブの `contents: write` に必要です。ブランチ保護でbotのpushが拒否される場合は、Qiitaへの反映後にメタデータの保存が失敗し得るため、再投稿する前にActionsログと記事IDを確認してください。

公開を止める場合は `QIITA_PUBLISH_ENABLED` を `false` にします。進行中の実行は別途確認してください。今回のセットアップではQiita APIへの投稿・更新は実施していません。

## 競合を避ける運用

- 本文はGitHubで編集し、Qiita上では直接編集しません。
- Qiitaで直接編集した場合は、双方の差分を確認してGitHubへ必要な変更を取り込みます。通常運用で `publish --force` や `pull --force` を使用しません。
- `id` と `updated_at` を手動で消しません。記事の複製時は既存IDを持ち越さないでください。同じIDを複数ファイルで管理しません。
- Markdown削除だけではQiitaの記事は削除されません。削除はQiita側の操作を含む別作業として扱います。
- `includePrivate: false` を維持します。限定共有記事でもPublicリポジトリへ置けば本文は公開されます。
- CLIと公開Actionは両方1.10.0に固定しています。更新時は公式Releaseを確認し、package-lockとActionのバージョンを合わせて検証します。

## 記事方針と参照元

記事には、作った理由、困りごと、解決方法、設計、実運用での発見、制限・注意点を含めます。別のWorkの会話を技術情報の根拠にはしません。

最初の記事はGmail Bridgeを予定しています。執筆時に https://github.com/sosboy-san/gmail_bridge の現在のREADME、Release、Docker Hub情報、制限事項を確認します。「Gmailアプリで外部メールを見る」と「外部メールを本家Gmailへ入れる」の違いを扱います。この記事の本文作成・公開はセットアップ完了後の別作業です。

## 公式資料

確認日: 2026-09-30（日本時間）

- [Qiita CLI公式README](https://github.com/increments/qiita-cli)
- [Qiita CLI公式公開Action](https://github.com/increments/qiita-cli/blob/v1.10.0/actions/publish/action.yml)
- [Qiita CLI Releases](https://github.com/increments/qiita-cli/releases)

## GitHubへの初期登録（未作成の場合）

GitHub認証済みの環境で、初期commitを含むこのディレクトリから次を実行します。GitHub CLIへのログインは本人が行います。

```sh
gh auth login
gh repo create sosboy-san/qiita-articles --public --source=. --remote=origin --push --description "GitHubを正本とするQiita技術記事管理"
```

同名リポジトリが既にある場合は新規作成せず、中身を確認してから接続してください。
