import Document, {Head, Html, Main, NextScript} from 'next/document';

import {AppConfig} from '@/utils/AppConfig';
import LogRocket from 'logrocket';

// Need to create a custom _document because i18n support is not compatible with `next export`.
class MyDocument extends Document {
    // eslint-disable-next-line class-methods-use-this
    render() {
      LogRocket.init('nabzyv/ayudateadar');
        // @ts-ignore
        return (
            <Html lang={AppConfig.locale}>
                <Head>
                    <script async type="text/javascript"
                            src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
                    <script async type="text/javascript"
                            src="https://js.openpay.mx/openpay.v1.min.js"></script>
                    <script async type='text/javascript'
                            src="https://js.openpay.mx/openpay-data.v1.min.js"></script>
                </Head>
                <body>
                <Main/>
                <NextScript/>
                </body>
            </Html>
        );
    }
}

export default MyDocument;
