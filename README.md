# Asteria Digital Bank

Asteria Digital Bank は、ローカル環境で動作する銀行Webアプリケーションです。口座残高、口座詳細、取引履歴、振込、AIアシスタントを1つのNode.jsプロセスで利用できます。

## 動作要件

- Node.js 20以降
- 外部npmパッケージは不要です

## 起動方法

```bash
npm start
```

起動後、ブラウザーで次のURLを開きます。

```text
http://127.0.0.1:3000
```

起動時にターミナルへ6桁のアクセスコードが表示されます。ログイン画面でそのコードを入力してください。

毎回同じアクセスコードを使う場合は、環境変数を設定して起動できます。

### Windows コマンドプロンプト

```bat
set ASTERIA_ACCESS_CODE=246810
npm start
```

### PowerShell

```powershell
$env:ASTERIA_ACCESS_CODE="246810"
npm start
```

### macOS / Linux

```bash
ASTERIA_ACCESS_CODE=246810 npm start
```

## ログインユーザー

- `yamada` - 山田 太郎
- `sato` - 佐藤 美咲

## 主な画面

- ログイン
- ホーム（口座一覧・総資産残高・最近の入出金）
- 口座詳細
- 振込
- AIアシスタント

ログイン後は各機能が独立した画面として表示され、上部メニューから移動できます。

このアプリケーションは既定で `127.0.0.1` のみに待ち受けます。
