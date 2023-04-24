const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");
const { google } = require("googleapis");
const core = require("@actions/core");

const gscKeyBase64 = core.getInput("credentials");
const name = core.getInput("name");
const mimeType = core.getInput("mime-type");
const file = core.getInput("file");
const folderId = core.getInput("folder-id");

const credentials = JSON.parse(Buffer.from(gscKeyBase64, "base64").toString("ascii"));

const auth = new GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/drive.file",
});

const service = google.drive({ version: "v3", auth });

const requestBody = { name, parents: [folderId] };

const media = {
    mimeType,
    body: fs.createReadStream(file),
};

service.files
    .create({ requestBody, media, fields: "webViewLink,id" })
    .then((result) => {
        core.setOutput("fileId", result.data.id);
        core.setOutput("shareableLink", result.data.webViewLink);
    })
    .catch((err) => core.error(err));
