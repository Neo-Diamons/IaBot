import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder } from 'discord.js'
import { loading } from './'

type Request = {
  prompt: string;
  negative_prompt: string;
  styles: string[];
  seed: number;
  subseed: number;
  subseed_strength: number;
  seed_resize_from_h: number;
  seed_resize_from_w: number;
  sampler_name?: string;
  batch_size: number;
  n_iter: number;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
  restore_faces: boolean;
  tiling: boolean;
  do_not_save_samples?: boolean;
  do_not_save_grid?: boolean;
  eta: number;
  denoising_strength: number;
  s_min_uncond?: number;
  s_churn: number;
  s_tmax: number;
  s_tmin: number;
  s_noise: number;
  override_settings?: Record<string, unknown>;
  override_settings_restore_afterwards?: boolean;
  refiner_checkpoint?: string;
  refiner_switch_at?: number;
  disable_extra_networks?: boolean;
  firstpass_image?: string;
  comments?: Record<string, unknown>;
  enable_hr: boolean;
  firstphase_width: number;
  firstphase_height: number;
  hr_scale?: number;
  hr_upscaler?: string;
  hr_second_pass_steps?: number;
  hr_resize_x?: number;
  hr_resize_y?: number;
  hr_checkpoint_name?: string;
  hr_sampler_name?: string;
  hr_prompt?: string;
  hr_negative_prompt?: string;
  force_task_id?: string;
  sampler_index: string;
  script_name?: string;
  script_args?: unknown[];
  send_images?: boolean;
  save_images?: boolean;
  alwayson_scripts?: Record<string, unknown>;
  infotext?: string;
}

const request: Request = {
  prompt: '',
  negative_prompt: '',
  batch_size: 1,
  cfg_scale: 7,
  denoising_strength: 0,
  enable_hr: false,
  eta: 0,
  width: 512,
  height: 512,
  firstphase_height: 0,
  firstphase_width: 0,
  n_iter: 1,
  restore_faces: false,
  s_churn: 0,
  s_noise: 1,
  s_tmax: 0,
  s_tmin: 0,
  sampler_index: 'DPM++ 2M Karras',
  seed: -1,
  seed_resize_from_h: -1,
  seed_resize_from_w: -1,
  steps: 30,
  styles: [],
  subseed: -1,
  subseed_strength: 0,
  tiling: false,
}

type Response = {
  images: string[];
  parameters: Request;
  info: string;
} | {
  detail: {
    loc: [string, number];
    msg: string;
    type: string;
  }[];
}

export async function draw(interaction: CommandInteraction) {
  const options = interaction.options as CommandInteractionOptionResolver
  request.prompt = options.getString('prompt') ?? ''
  request.negative_prompt = options.getString('negative_prompt') ?? ''
  request.seed = options.getInteger('seed') ?? -1

  const embed = new EmbedBuilder()
    .setTitle('Generating Image')
    .setColor('Aqua')
    .setDescription('Image is being generated...')

  await interaction.reply({ embeds: [embed] })

  const result = fetch('http://localhost:7860/sdapi/v1/txt2img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  loading(interaction, embed)

  const data = await (await result).json() as Response
  if ('detail' in data) {
    embed
      .setTitle('Error')
      .setColor('Red')
      .setDescription('There was an error generating the image')
      .setFields()
    await interaction.editReply({ embeds: [embed] })
    return
  }

  const imageStream = Buffer.from(data.images[0], 'base64')

  embed
    .setTitle('Generated Image')
    .setColor('Aqua')
    .setDescription('\n')
    .setFields( [
      { name: 'Prompt', value: request.prompt ?? 'None' },
      { name: 'Negative Prompt', value: request.negative_prompt ?? 'None' },
      { name: 'Seed', value: JSON.parse(data.info).seed.toString() },
    ])
    .setImage('attachment://image.png')
    .setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL() ?? undefined })

  await interaction.editReply({
    embeds: [embed],
    files: [{
      name: 'image.png',
      attachment: imageStream
    }]
  })
}
