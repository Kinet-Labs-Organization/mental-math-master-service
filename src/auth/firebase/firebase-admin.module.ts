// firebase-admin.module.ts
import * as admin from 'firebase-admin';
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId: 'mmm-oauth',
            clientEmail: 'firebase-adminsdk-fbsvc@mmm-oauth.iam.gserviceaccount.com',
            privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDi09pUf9MPUVyK\nPjxocz/eIbMxMAdj73TBfcwG9RWwO2YtKs1RloMt/zqYjQsksKFKA0k1fkZLE9I9\nv2e73ncJAb/HfK3VXjFXSxTDuLAqBJubkpabF4CD/KTixUZB1acCWBwBV/rRc3Z9\n9cg3BcBUJLMtQVb45EHYLRgMD0O+ZQlCZERgG4QK7gNl5DrMS9Mq+cqJ5Tlihnpa\nEQfoPmYWr43QplHZHUxY04lKEvLOa3qcYAhSGuZtw9geyBj/szKH2tRzfc+5cvbH\njzH34EIcRubIK6CCl+q3gcplI/F4P36Gu9+xUtr9ezC7aha+pPhQqH3XOKz9aI3w\nv8QOc0h9AgMBAAECggEACWYE0GaBfMt+vZ2pjBxmY5Ja5elbDQmBeXj4aLtj/Crh\n53I0ErLdWZ0PNP33HbyR2kq7kFNcn0TBe9x/9FlZ7k4bv6zLWSFvgvHx+NAgwITz\nW6VdxyxYn19rB5hr+lNbea3j7yxRkLcrjDmQY7NBzlq8792auHJgxg/MRMenI27h\nVKONUvDcdyDJFbu5vFi5OB/trEe4rV0DvsU+TqpOAZs2N5ZmBc3M6frnAURWqw9P\nnFi/Qp5Pzctre9TgER7hdZ+ld5AdB5TmuQzF8RdjXS0p/ponATM6o2TK56Fzfzq7\nHRwMjdAikPYJpRnrRqMpOVVScCQfGFdXE48ND8kVUwKBgQDw/5WlKJ94dULTFkgF\nRyQlZ4QDW7g21KsAIqhA78mksjWxzo8FCu3o6cUIQ+tlHYP52YD0dckTfTh2IG1J\nFwBbpbSrMsU1DGqwom5akvfTCTo02Tdh4V4imsXTQs/6fD5EY/BHCY9v01awbOWs\n+yMgdTx/rkhlJ9+4jFY41cDWHwKBgQDw8nMuFs0hII6mn2IvwzzuZwLIhxX2zx+s\nlCz0CrwOqHlPdxLb2LaadpGXxnC3RnirE0DIN/5yQIO4azT4ipJCo0Iy8Xn/b56c\nmToDYrVjkSNN+nENhvLPE7DEC4cAfS9vmqYbbQNY9fPMg4pFCe9/GVrzaowjxyn0\ndwTxSb814wKBgGpNksijPpR3xN4ved06ICuPmZ+RmZQ2Aqewod7i5mMLaLvhjRyA\nUajnVM3sh6y2dDyFQGiUe/loxrr0WsBesP27/hF1958KtxTq0RqKsV4ZN9+P4On/\n6vIAqzogwnSO0TiBjL8I7Ig7BIYVwsmmjTwH+oOncK+OAxT4ch/nyYOpAoGBAM3v\niz5jQqQDvajwJO2Jw3RIGvrlaoJueTX514ol+qHUoQqoTTgWO8w9dybv9rrOwqgF\nZqM6KIHiXjKrfrTHS0clXplIBuuprTlPRWRLY5lcHX6yhRn4s2MGA1ksORDT7k1H\nMp3SSMAqR1wPOYjUexx4wWG3OVwDB/roFxNb4s/dAoGBAMD/G6Eg21cS+/0f+38R\njWyYnBf0PgfI6xcFXl0oqzPYOPTSLw5WbtDw+8ylQB1x6S+3BvvGgjlhfRaZQSMI\n0JbvxyTxTUsR3YsZS1okeTslFsyfDwIzxK6mKPHZha6tSRsXzwa6mp8JIMXhQBSG\nHnuZhBN2ZnRsmGiEPfzTwTPa\n-----END PRIVATE KEY-----\n',
          }),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseAdminModule {}