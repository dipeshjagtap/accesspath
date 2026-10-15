# Next step: Vertex AI login (required once)

Your project is set to **`accesspathai`**.  
`gcloud` is installed under `~/google-cloud-sdk`.  
The Gemini **API key is still blocked** (`API_KEY_SERVICE_BLOCKED`), so use **ADC + Vertex**.

## Run in your own terminal (interactive browser login)

```bash
source "$HOME/google-cloud-sdk/path.bash.inc"
gcloud auth login
gcloud auth application-default login
gcloud config set project accesspathai
```

Then verify:

```bash
cd ~/Documents/personal/accesspath
npx tsx --env-file=.env.local scripts/smoke-gemini-key.ts
```

Expect `"source": "vertex_ai"` and `"ok": true`.

## If you prefer fixing the API key instead

Edit key **accesspathai** → API restrictions → include **Generative Language API / Gemini API** → bind service account **accesspath@accesspathai.iam.gserviceaccount.com** → Save.

## App behavior meanwhile

Plans still work with the **deterministic grounded fallback**. Live Gemini starts after ADC (or an unblocked API key).
