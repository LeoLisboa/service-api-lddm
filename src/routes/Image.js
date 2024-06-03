const azure = require('azure-storage')
const { v1: uuidv1 } = require('uuid');

async function saveImageAzure(imageBase64) {
    let fileName = uuidv1() + '.png';

    const blobSvc = azure.createBlobService("DefaultEndpointsProtocol=https;AccountName=lddmftpimage;AccountKey=BHKeyz2mN64vXYa5fz8Ei5vztwNMo1hA7ds7N7Kcqhx9EX4u+WVUnxQu06hGy9XmmFRZzj3e/Ct4+ASt7aqxrA==;EndpointSuffix=core.windows.net");

    let buffer = Buffer.from(imageBase64, 'base64')

    blobSvc.createBlockBlobFromText('sftp', fileName, buffer, {
        contentType: 'image/png'
    }, function (error, result, response) {
        if (error) {
            fileName = 'default.png'
        }
    });

    return `https://lddmftpimage.blob.core.windows.net/sftp/${fileName}`

}

module.exports = { saveImageAzure };