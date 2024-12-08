<script setup>
definePageMeta({
  layout: false, // Disable the layout entirely
})
</script>

<template>
  <div>
    <iframe
      srcdoc="
        <!DOCTYPE HTML>
        <html lang='en'>
          <head>
            <title>404 Not found</title>
            <meta charset='utf-8' />
            <meta name='viewport' content='width=device-width,initial-scale=1' />
            <meta name='color-scheme' content='light only' />
            <meta name='description' content='Not found :(' />
            <meta property='og:site_name' content='404 Not found' />
            <meta property='og:title' content='404 Not found' />
            <meta property='og:type' content='website' />
            <meta property='og:description' content='Not found :(' />
            <link href='https://fonts.googleapis.com/css2?display=swap&family=Alata:ital,wght@0,400;1,400' rel='stylesheet' type='text/css' />
            <link rel='stylesheet' href='/404.css' />
            <style>
              body, html {
                margin: 0;
                padding: 0;
                overflow: hidden; /* Prevent scrolling inside the iframe */
                width: 100%;
                height: 100%;
              }
              #wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <div id='wrapper'>
              <div id='main'>
                <div class='inner'>
                  <p id='text04'><sup>Error 404</sup></p>
                  <h1 id='text01'>Damn.</h1>
                  <h3 id='text02'>The URL you&#39;re looking for does not seem to exist in our system.</h3>
                  <p id='text03'>We hope this cat picture calms you down.</p>
                  <div id='embed01'>
                    <img src='https://cataas.com/cat' width='350' height='auto' alt='A cat image' longdesc='A random cat image that changes every time you refresh the page' />
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      "
      class="w-screen h-screen border-0"
      style="overflow: hidden;" <!-- Prevent iframe scrollbars -->
    ></iframe>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
</style>
