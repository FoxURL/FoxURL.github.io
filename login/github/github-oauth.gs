function doGet(e) {
  var action = e.parameter.action || '';
  if (action !== 'github_callback') {
    return ContentService.createTextOutput('Missing GitHub OAuth action.');
  }

  var code = e.parameter.code;
  if (!code) {
    return redirectToFoxUrl('?error=missing_code');
  }

  var properties = PropertiesService.getScriptProperties();
  var clientId = properties.getProperty('GITHUB_CLIENT_ID');
  var clientSecret = properties.getProperty('GITHUB_CLIENT_SECRET');

  var tokenResponse = UrlFetchApp.fetch('https://github.com/login/oauth/access_token', {
    method: 'post',
    contentType: 'application/json',
    headers: { Accept: 'application/json' },
    payload: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code
    }),
    muteHttpExceptions: true
  });
  var token = JSON.parse(tokenResponse.getContentText()).access_token;
  if (!token) {
    return redirectToFoxUrl('?error=token_exchange_failed');
  }

  var userResponse = UrlFetchApp.fetch('https://api.github.com/user', {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' }
  });
  var user = JSON.parse(userResponse.getContentText());
  var email = user.email || findGithubEmail(token);
  if (!email) {
    return redirectToFoxUrl('?error=email_unavailable');
  }

  return redirectToFoxUrl('?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(user.name || user.login));
}

function findGithubEmail(token) {
  var response = UrlFetchApp.fetch('https://api.github.com/user/emails', {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' }
  });
  var emails = JSON.parse(response.getContentText());
  var verified = emails.filter(function (entry) { return entry.verified; });
  var primary = verified.filter(function (entry) { return entry.primary; });
  return (primary[0] || verified[0] || {}).email || '';
}

function redirectToFoxUrl(query) {
  var destination = 'https://foxurl.github.io/login/github/' + query;
  var escapedDestination = destination.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  var html = '<!doctype html><html><head><base target="_top">' +
    '<meta http-equiv="refresh" content="0;url=' + escapedDestination + '"></head>' +
    '<body><p>Returning to FoxURL...</p><p><a href="' + escapedDestination + '">Continue to FoxURL</a></p></body></html>';
  return HtmlService.createHtmlOutput(html);
}