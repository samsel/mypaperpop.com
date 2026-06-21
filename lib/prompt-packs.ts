export interface PromptPack {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  description: string;
  prompts: string[];
}

export const PROMPT_PACKS: PromptPack[] = [
  {
    id: 'under-the-sea',
    name: 'Under the Sea',
    shortName: 'Sea',
    emoji: '🌊',
    description: 'Ocean creatures and underwater adventures',
    prompts: [
      'A friendly octopus juggling seashells',
      'A sea turtle swimming through a coral reef',
      'A smiling whale splashing in the waves',
      'A treasure chest at the bottom of the ocean with fish swimming around it',
      'A cute seahorse family in a kelp forest',
      'A playful dolphin jumping over a rainbow',
    ],
  },
  {
    id: 'space-adventure',
    name: 'Space Adventure',
    shortName: 'Space',
    emoji: '🚀',
    description: 'Rockets, planets, and astronauts',
    prompts: [
      'An astronaut floating in space with a pet dog',
      'A rocket ship blasting off from a moon crater',
      'A friendly alien waving from a flying saucer',
      'A space station orbiting a ringed planet',
      'A robot exploring the surface of Mars',
      'The solar system with smiling planets',
    ],
  },
  {
    id: 'dinosaur-world',
    name: 'Dinosaur World',
    shortName: 'Dinosaurs',
    emoji: '🦖',
    description: 'Prehistoric creatures and volcanoes',
    prompts: [
      'A baby T-Rex hatching from an egg',
      'A friendly Triceratops munching on leaves',
      'A Pterodactyl soaring over a volcano',
      'A Brontosaurus family walking through a jungle',
      'A Stegosaurus playing in a river',
      'Two dinosaurs having a picnic together',
    ],
  },
  {
    id: 'enchanted-forest',
    name: 'Enchanted Forest',
    shortName: 'Forest',
    emoji: '🌳',
    description: 'Fairy tales and magical creatures',
    prompts: [
      'A fairy sitting on a giant mushroom',
      'A unicorn drinking from a sparkling stream',
      'A treehouse in an enormous magical oak tree',
      'A gnome tending a garden of giant flowers',
      'A dragon guarding a castle in the woods',
      'A magical fox with a glowing tail in the moonlight',
    ],
  },
  {
    id: 'farm-animals',
    name: 'Farm Animals',
    shortName: 'Farm',
    emoji: '🐄',
    description: 'Barnyard friends and farm life',
    prompts: [
      'A rooster crowing on top of a red barn',
      'A mother hen with baby chicks following behind',
      'A happy pig rolling in a mud puddle',
      'A cow grazing in a field of wildflowers',
      'A horse running through a green meadow',
      'A sheepdog herding fluffy sheep into a pen',
    ],
  },
  {
    id: 'birthday-party',
    name: 'Birthday Party',
    shortName: 'Birthday',
    emoji: '🎂',
    description: 'Celebrations, cakes, and party fun',
    prompts: [
      'A giant birthday cake with candles and sprinkles',
      'Animals wearing party hats at a birthday table',
      'A clown making balloon animals at a party',
      'A piñata shaped like a star bursting with candy',
      'Kids dancing under a disco ball with streamers',
      'A magician pulling a rabbit out of a hat at a party',
    ],
  },
  {
    id: 'superhero-squad',
    name: 'Superhero Squad',
    shortName: 'Heroes',
    emoji: '🦸',
    description: 'Heroes, capes, and superpowers',
    prompts: [
      'A superhero cat flying over a city skyline',
      'A team of kid heroes standing on a rooftop',
      'A superhero dog with a cape rescuing a kitten from a tree',
      'A hero using ice powers to build an ice castle',
      'A superhero robot protecting a playground',
      'A young hero discovering their superpower for the first time',
    ],
  },
  {
    id: 'transportation',
    name: 'Transportation',
    shortName: 'Vehicles',
    emoji: '🚗',
    description: 'Cars, trains, planes, and boats',
    prompts: [
      'A steam train crossing a tall bridge over a river',
      'A fire truck racing down a street with lights flashing',
      'A hot air balloon floating over a countryside',
      'A pirate ship sailing through stormy seas',
      'A race car zooming around a track',
      'A helicopter landing on top of a tall building',
    ],
  },
];
