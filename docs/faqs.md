# FAQs

## 1. Why can't I create a link?

Please check the Cloudflare KV bindings, the KV environment variable name should be all uppercase letters.

<details>
  <summary><b>Screenshots</b></summary>
  <img alt="KV" src="https://github.com/ccbikai/Sink/assets/21292149/3b7d584c-3afe-4d24-8c9e-e0d549c47438"/>
</details>

## 2. Why can't I log in?

Please check if `NUXT_SITE_TOKEN` is set to pure numbers, Sink does not support pure number Tokens, we consider this to be unsafe.

## 3. Why can't I see the analytics data?

Analytics data needs to read Cloudflare's data, check if `NUXT_CF_ACCOUNT_ID` and `NUXT_CF_API_TOKEN` are correctly configured. Pay attention to the account id deployment zone id, whether the Worker analytics engine is turned on.

<details>
  <summary><b>Screenshots</b></summary>
  <img alt="Analytics" src="https://github.com/ccbikai/Sink/assets/21292149/aceede26-5aa1-400c-8d06-d6adc46bdcb8"/>
</details>

## 4. I don't want the current homepage? Can it be redirected to my blog?

Of course. Please set the environment variable `NUXT_HOME_URL` to your blog or official website address.
