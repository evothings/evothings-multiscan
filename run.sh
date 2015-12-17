export MULTISCAN_SSL_KEY_PATH=$PWD/cert/ssl.key.nopass
export MULTISCAN_SSL_CERT_PATH=$PWD/cert/ssl.crt
export MULTISCAN_CERTFILE_PATH=$PWD/cert/sub.class1.server.ca.pem

mix phoenix.server
