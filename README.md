# bindist sdk

`@keymailer/bindist`, the typescript and javascript client of the bindist binary distribution api.
No dependencies, it runs wherever `fetch` and `Blob` exist (node 20+, bun, deno, workers, browsers).

| Import | Holds the api key | What |
| --- | --- | --- |
| `@keymailer/bindist` | yes | `Bindist`, the client for a server or a build script |
| `@keymailer/bindist/node` | yes | `pathUpload`, uploads a file on disk |
| `@keymailer/bindist/upload` | no | `partsSend`, the part of an upload a front end does |

## Installing

```bash
npm install github:KeyMailer/bindist-ts-js-sdk#v0.1.0
```

The same goes for bun, pnpm and yarn. Every release is a tag of this repository, which holds the
built package. npm also takes a range: `github:KeyMailer/bindist-ts-js-sdk#semver:^0.1.0`.

## Using

```ts
import { Bindist } from "@keymailer/bindist";
import { pathUpload } from "@keymailer/bindist/node";

const bindist = new Bindist({ url: "https://bindist.example.com", key: process.env.BINDIST_KEY });

// upload, the key is what the build is asked for by from now on
const { key } = await pathUpload(bindist, "build/game.zip", { intent: "private" });
// or anything that is a Blob (a File, Bun.file(path))
await bindist.fileUpload(blob, { intent: "private", filename: "game.zip" });

// a link that expires
const { url, expires_at } = await bindist.downloadRequest({ key, as: "private" });
// make it public, resolves with the permanent url once the build was moved
const public_url = await bindist.publicUrlWait(key);
```

* A build starts `"private"` (only its uploader can ask for it, through links that expire) or
  `"public"` (a permanent url). `intent` says which at upload, `as` says what is wanted at download:
  `as: "public"` on a private build makes it public for good.
* `downloadRequest` always answers `{ url, expires_at, state }` with a url that works now.
  `expires_at` is a date or `"never"` (`NEVER`), only store a url that says `"never"`. While a build
  is being made public the `state` is `"promoting"` and the url is one that expires.
* A failure is a `BindistError` with the http `status` (0 when there was no response) and the api's
  message, plus the `part` when it is about one.
* `filename` only takes `A-Z a-z 0-9 . _ + -`, `filenameClean(name)` turns any name into one.
  `pathUpload` does it on its own.
* Uploads take `parallel`, `attempts`, `signal` and `on_progress(sent, total)`. The progress moves
  one part at a time.

## Uploads from a front end

The api key stays on the consumer's server. The server asks for the upload and hands the result to
the front end, which sends the bytes straight to the storage and needs nothing but those urls:

```ts
// server: the size comes from the front end
const upload = await bindist.uploadRequest({ intent: "private", filename, size });
// -> send `upload` to the front end

// front end: file is the File of an <input type="file">
import { partsSend } from "@keymailer/bindist/upload";
const parts = await partsSend(upload.parts, file, { on_progress });
// -> send `parts` back to the server

// server
await bindist.uploadComplete({ key: upload.key, parts });
```

The server decides who may upload and how much: the urls only take a file of exactly the announced
`size`, until `upload.expires_at`.

A browser is only let through for the origins the platform allows: ask for the origin of your front
end to be added when you get your api key.
