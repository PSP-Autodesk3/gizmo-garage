"use client";

import { checkActionCode, applyActionCode, sendPasswordResetEmail } from "firebase/auth";
import { useSearchParams } from 'next/navigation'
import { auth } from '@/app/firebase/config';
import { useEffect } from "react";

 export default function EmailHandler() {
        const searchParams = useSearchParams(); //used this to get parameters within the link https://nextjs.org/docs/app/api-reference/functions/use-search-params - Jacob

        useEffect(() =>{
            const mode = searchParams.get('mode');
            const actionCode = searchParams.get('oobCode');
            const continueUrl = searchParams.get('continueUrl');
            const lang = searchParams.get('lang') || 'en';

            console.log(mode, actionCode, continueUrl, lang);

            if (actionCode) {
                handleRecoverEmail(auth, actionCode)
            }
        });
    
    function handleRecoverEmail(auth:any, actionCode:any) {
        //checks if link is clicked
        let restoredEmail:any;
        checkActionCode(auth, actionCode).then((info) => {

            //gets old email
            restoredEmail = info['data']['email'];

            //reverts to old email
            return applyActionCode(auth, actionCode);
        }).then(() => {
            //email reverted
            console.log('reverted to:', restoredEmail);
            //maybe include password reset too
        }).catch((error) => {
            //Invalid code
            console.log('error');
        });
    }

    function handleVerifyEmail(actionCode: any, continueUrl: any, lang: string) {
        applyActionCode(auth, actionCode).then((resp) => {
            console.log("hello");
        }).catch((error) => {

        })
    }
}

