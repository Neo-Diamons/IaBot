import { Client, CommandInteraction, Events, GatewayIntentBits } from 'discord.js'
import { draw, registerCommands } from './commands'
import dotenv from 'dotenv'

const process = dotenv.config()
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
})

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return

  const { commandName } = interaction as CommandInteraction
  switch (commandName) {
  case 'draw':
    await draw(interaction)
    break
  default:
    break
  }
})

const TOKEN = process.parsed?.TOKEN
const CLIENT_ID = process.parsed?.CLIENT_ID
const GUILD_ID = process.parsed?.GUILD_ID

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  throw new Error('Missing required environment variables')
}

client.login(process.parsed?.TOKEN)
registerCommands(TOKEN, CLIENT_ID, GUILD_ID)
