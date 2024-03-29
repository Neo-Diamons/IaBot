import { REST, Routes } from 'discord.js'

export async function registerCommands(TOKEN: string, CLIENT_ID: string, GUILD_ID: string) {
  const rest = new REST({ version: '10' }).setToken(TOKEN)

  const commands = [
    {
      name: 'draw',
      description: 'Generate a image',
      options: [
        {
          name: 'prompt',
          description: 'The prompt to generate an image from',
          type: 3,
          required: true
        },
        {
          name: 'negative_prompt',
          description: 'The negative prompt to generate an image from',
          type: 3,
          required: false
        },
        {
          name: 'seed',
          description: 'The seed',
          type: 4,
          required: false
        },
      ]
    }
  ]

  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
  } catch (error) {
    console.error(error)
  }
}
