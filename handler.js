'use strict';
const AWS = require('aws-sdk');
const multipart = require('aws-lambda-multipart-parser');

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID, 
  secretAccessKey: process.env.SECRET_ACCESS_KEY, 
  region: 'us-east-1'
});

exports.uploadFile = async (event, context) => {
  try {

    const formData = multipart.parse(event, true);
    if (formData.file) {
        const file = formData.file;
            // Sacar el buffer desde el file.content
            const key = `documentos/${new Date().getTime()}`
            const url = await uploadS3(file, key);
            return {
              statusCode: 200,
              body: JSON.stringify({
                  url: url
              }),
            };
    }else{
      return {
        statusCode: 500,
        body: JSON.stringify('No se reconoce el archivo'),
      };
    }
      
  

   
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error al subir el archivo'),
    };
  
  }
}

const uploadS3 = (file, key) => {
  return new Promise((resolve, reject) => {
    const s3Bucket = new AWS.S3({
      params: {
        Bucket: process.env.BUCKET
      }
    });

    const data = {
      Key: key,
      Body: file.content,
      ACL: 'public-read',
      ContentType: file.contentType
    };

    s3Bucket.putObject(data, (err, dataSuccess) => {
      if (err) {
        reject({
          error: `Error al cargar la imagen en S3 [${err}]`
        });
      } else {
        const objectUrl = `https://${process.env.BUCKET}.s3.amazonaws.com/${key}`;
        resolve(objectUrl);
      }
    });
  });
}


