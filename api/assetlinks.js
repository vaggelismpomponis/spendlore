export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).json([
    {
      "relation": [
        "delegate_permission/common.handle_all_urls",
        "delegate_permission/common.get_login_creds"
      ],
      "target": {
        "namespace": "android_app",
        "package_name": "com.bomponis.spendwise",
        "sha256_cert_fingerprints": [
          "39:A1:6B:AC:A6:F8:25:F6:ED:0A:0E:79:06:DA:3E:58:6B:B9:97:AE:02:A8:01:4D:B8:7B:39:65:DE:02:C2:86"
        ]
      }
    }
  ]);
}

