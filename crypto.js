const crypto = require('crypto');
const rand = require('csprng');

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

const encrypt = (text, secretKey) => {
    console.log("Encrypting...");
    key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
    try {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        console.log("Done!");
        return {
            iv: iv.toString('hex'),
            content: encrypted.toString('hex')
        };
    } catch (error) {
        console.log(error)
    }




};

const decrypt = (hash, secretKey) => {
    key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

const hash_id = (datetime, ip) => {
    return crypto.createHash('md5').update(datetime.toString() + rand(160, 36) + ip).digest('hex');
}

module.exports = {
    encrypt,
    decrypt,
    hash_id
};