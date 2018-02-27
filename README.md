# Blockchain Copyright Demo

This project was developed based on a cooperation with http://www.instinctools.ru/
The full demo and background information is available at: https://blockchain-business.de

## What it does?
It uses the Eteherum Blockchain to store a Hash of an document. By this simple application an person can prove ownership: 

This Application allows to prove that digital assets have been issued by a certified institution, examples are:

    PDF file of a University Degree
    JPG of a Qualification Certificate
    MP3 Recording of a Speech

### University - Certificate Issuer

A University (or any other institution) is sending graduation certificates as PDF documents to their students. At the same time the University uploads the HASH of this document to the Blockhain.

A HASH is a long number that can be calculated from any file (pdf, jpg, mp3). When the file is changed at any place (even just a single bit) that Hash will change. The Hash number is so big, that each different file in the universe will have a different Hash.
#   ## Hiring Company - Certificate Validator

A hiring company is receiving a PDF certificate from a job candidate. The company can now calculate the HASH of this PDF and check it against the Hash in the Blockchain. If Hashes are identical the company can be sure that the certificate was issued by the University and was not altered or manipulated.

By mathematics, it is never possible to reconstruct the original document from the Hash and this appication never uploads the document, but only the Hash. Both the University and the student can be sure that the certificate itself will never be visible to the public.

## How it works
The demno has 2 components, the fuel server to pay for gas that is needed in Ethereum Blockchain and the WebServer that
provides the application. It can be deployed as a standard Node.js application. You will need to adjust the addresses of the Smart Contract.
The following env - variables are also checked:

    REDIS_URL
    WALLET_KEY
    BC_FUELSERVER_URL

In case of any question: https://blockchain-business.de/ueber-mich/

