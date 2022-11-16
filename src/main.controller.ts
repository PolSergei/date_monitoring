import {Request, Response} from 'express';
import axios, {AxiosError, AxiosResponse, Axios} from "axios";

export function getCaptchaPage() {
    const axios = new Axios({baseURL:'https://service2.diplo.de'});
    axios.get(
        '/rktermin/extern/appointment_showMonth.do?locationCode=tifl&realmId=744&categoryId=1344'
    )
        .then(function (resp: AxiosResponse) {
            console.log(resp);
        })
        .catch(function (err: AxiosError) {
            console.log(err);
        });
};