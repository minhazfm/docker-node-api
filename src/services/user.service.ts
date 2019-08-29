import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid/v4';

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

export class UserService {

    private readonly _jwtSecret = '0.rfyj3n9nzh';
    
    login(client: string, username: string, password: string): Promise<string> {
        // bcrypt.genSalt(10)
        //     .then(salt => {
        //         bcrypt.hash(password, salt)
        //             .then(hash => {
        //                 console.log("Hash PW: ", hash);
        //             })
        //             .catch(error => {
        //                 throw error
        //             });
        //     })
        //     .catch(error => {
        //         throw error
        //     });

        // bcrypt.hash(password, this._saltRounds)
        //     .then((hash) => {
        //         console.log(hash);
        //     });

        return readFile(path.join(__dirname, '../assets', 'user.json'), 'utf8')
            .then(data => {
                let user = JSON.parse(data);

                if (user.username !== username) {
                    throw new Error('Wrong username or password, please try again');
                }

                return bcrypt.compare(password, user.password)
                    .then(isValid => {
                        if (isValid) {
                            let jwtTokenID: string = uuid();
                            return this.tokenCreater(client, user.uuid, jwtTokenID)
                        }
                        else {
                            throw new Error('Error comparing passwords');
                        }
                    })
                    .catch(error => {
                        throw new Error('Incorrect password, please try again');
                    });
            })
            // .catch(error => {
            //     throw new Error('Could not read user.json asset file');
            // })
    }

    inputTokenToAccountPayload(value: string): Promise<void> {
        return readFile(path.join(__dirname, '../assets', 'account.json'), 'utf8')
            .then(data => {
                let newData = JSON.parse(data)
                newData.result[0].token = value
                // newData.result[0].contacts[0].avatar = BASE64IMAGE
                return writeFile(path.join(__dirname, '../assets', 'account.json'), JSON.stringify(newData, null, 4), 'utf8')
                    .then(() => {
                        return
                    })
                    .catch(error => {
                        console.log(error)
                        throw new Error('Could not write to account.json asset file for token input')
                    })
            })
            .catch(error => {
                console.log(error)
                throw new Error('Could not read account.json asset file for token input')
            })
    }

    tokenCreater(client: string, userUUID: string, tokenID: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign({
                jti: tokenID,
                uuid: userUUID,
            },
            this._jwtSecret, {
                algorithm: 'HS256',
                expiresIn: client === 'snMobile' ? '7d' : '1d',
            }, (error: any, token: string) => {
                if (error) {
                    return reject('Token creation error');
                }

                return resolve(token);
            });
        });
    }

    verifyToken(token: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this._jwtSecret, (err: any, decoded: any) => {
                if (err || decoded['uuid'] !== '3b688f16-7375-4477-99a7-4052ccd567d0') {
                    return reject(false);
                }

                return resolve(true)
            });
        });
    }

}