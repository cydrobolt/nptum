<html>
    <head>
        <title>nptum</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

        <link href='https://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>
        <link href='https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css' rel='stylesheet'>
        <script src='https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>

        <script src="/js/materialize.min.js"></script>
        <link href="/css/materialize.min.css" rel="stylesheet" type="text/css" />
        <link href="/css/app.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
        <div class='container'>
            <h3>nptum</h3>
            <div id='cards'>
                <!-- load cards here -->
            </div>
        </div>

        <script src='/js/handlebars-v4.0.5.js'></script>
        {{> handlebars_cards }}
        <script src='/js/nptum.js'></script>
    </body>
</html>
