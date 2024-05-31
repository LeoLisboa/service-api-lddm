const azure = require('azure-storage')
const { v1: uuidv1 } = require('uuid');

async function saveImageAzure(imageBase64) {
    let fileName = uuidv1() + `.png`;

    const blobSvc = azure.createBlobService("DefaultEndpointsProtocol=https;AccountName=ftplddm;AccountKey=7GADGSaAeNiVnIuEWdbHI1Go87695aN1zCpkZz1CMaapjK8+aqj5d8XFI33u8Ot3Lhy3OKM/QV5d+ASthqYCvw==;EndpointSuffix=core.windows.net");

    let buffer = Buffer.from(imageBase64, 'base64')

    blobSvc.createBlockBlobFromText('sftp', fileName, buffer, {
        contentType: 'image/png'
    }, function (error, result, response) {
        if (error) {
            fileName = 'default.png'
        }
    });

    return `https://ftplddm.blob.core.windows.net/sftp/${fileName}`

}

module.exports = { saveImageAzure };
