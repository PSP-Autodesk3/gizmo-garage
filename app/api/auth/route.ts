import { NextResponse } from 'next/server'
import crypto from 'crypto';

export async function GET(request: Request) {
    // https://aps.autodesk.com/en/docs/oauth/v2/tutorials/code-challenge/
    
    // Dependency: Node.js crypto module
    // https://nodejs.org/api/crypto.html#crypto_crypto
    function base64URLEncode(str: any) {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // Dependency: Node.js crypto module
    // https://nodejs.org/api/crypto.html#crypto_crypto
    function sha256(buffer: string) {
        return crypto.createHash('sha256').update(buffer).digest();
    }

    const code_verifier = base64URLEncode(crypto.randomBytes(32));
    const code_challenge = base64URLEncode(sha256(code_verifier));

    console.log("Raw:", base64URLEncode(sha256(code_verifier)))
    return NextResponse.json({
        code_verifier,
        code_challenge,
    });
}