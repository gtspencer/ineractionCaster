/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { pinata } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  hub: pinata()
})

const cinizFID = 7251
const danFID = 3
const jesseFID = 99
const jacekFID = 15983

app.frame('/', (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        > Has @______ interacted with your posts?
        </div>
      </div>
    ),
    intents: [
        <Button value="ciniz">↑ @ciniz</Button>,
        <Button value="dan">🟣 @drw.eth</Button>,
        <Button value="jesse">🔵 @jessepollak</Button>,
        <Button value="jacek">🎩 @jacek</Button>,
    ],
    action: '/response'
  })
})

app.frame('/response', async (c) => {
  const { verified, frameData, buttonValue } = c

  if (!verified) {
    return ReturnUnverified(c, "Please login to Farcaster")
  }

  const senderFid = frameData?.fid

  if (!senderFid) {
    return ReturnUnverified(c, "Please login to farcaster")
  }

  let influencerFid = cinizFID
  let influencerName = "Ciniz"

  switch (buttonValue) {
    case "dan":
      influencerFid = danFID
      influencerName = "Dan"
      break;
    case "jesse":
      influencerFid = jesseFID
      influencerName = "Jesse"
      break;
    case "jacek":
      influencerFid = jacekFID
      influencerName = "Jacek"
      break;
  }

  console.log(buttonValue)

  let casts = await client.fetchAllCastsCreatedByUser(senderFid, {
    limit: 100
  })

  let reacted = false
  for (let c of casts.result.casts) {
    const reactionFids = c.reactions.fids;
    if (reactionFids.includes(influencerFid)) {
      reacted = true
    }
  }

  let message = `🥺 Nope. Try bothering ${influencerName} more. 🥺`
  if (reacted) {
    message = `🥳 Yup!  ${influencerName} must like you a lot! 🥳`
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background:'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`${message}`}
        </div>
      </div>
    ),
  })
})


function ReturnUnverified(c: any, message: string) {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        > `{message}`
        </div>
      </div>
    ),
  })
}

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
