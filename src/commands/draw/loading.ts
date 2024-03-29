import { CommandInteraction, EmbedBuilder } from 'discord.js'

type Response = {
  progress: number;
  eta_relative: number;
  state: {
    skipped: boolean,
    interrupted: boolean,
    stopping_generation: boolean,
    job: string,
    job_count: number,
    job_timestamp: string,
    job_no: number,
    sampling_step: number,
    sampling_steps: number
  },
  current_image: string;
  textinfo: string;
} | {
  detail: {
    loc: [string, number];
    msg: string;
    type: string;
  }[];
}

export async function loading(interaction: CommandInteraction, embed: EmbedBuilder) {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const loadindResult = await fetch('http://localhost:7860/sdapi/v1/progress?skip_current_image=false', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const loadingData = await loadindResult.json() as Response
    if ('detail' in loadingData) {
      embed
        .setTitle('Error')
        .setColor('Red')
        .setDescription('There was an error generating the image')
        .setFields()
      await interaction.editReply({ embeds: [embed] })
      return
    }

    if (loadingData.state.job === '')
      break

    embed
      .setFields({ name: 'Progress', value: `${Math.round(loadingData.progress * 100)}%` })
    await interaction.editReply({ embeds: [embed] })
  }
}
