export interface DailyTheme {
  id: string;
  emoji: string;
  shortName: string;
  prompts: string[];
}

export interface DailyContent {
  forYou: string[];
  themes: DailyTheme[];
}

// 30-day rotating prompt calendar. Each day has 6 "For You" prompts
// and 8 theme tabs (each with 6 prompts). Composition per day:
// 3 core + 3 rotating + 2 wildcard themes.
export const DAILY_CONTENT: DailyContent[] = [
  // ─── Day 0 ───
  // Core: ocean, dinosaurs, animals | Rotating: farm, pirates, robots | Wildcard: circus, arctic
  {
    forYou: [
      'A friendly dragon reading a bedtime story to baby animals',
      'A sleepy bear cub wrapped in a blanket of stars',
      'A brave mouse sailing a leaf boat down a rushing river',
      'A giraffe trying to squeeze inside a tiny phone booth',
      'A circus elephant balancing on a giant beach ball',
      'A caterpillar packing a tiny suitcase to become a butterfly',
    ],
    themes: [
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A sea turtle gliding over a colorful coral reef',
          'A friendly octopus juggling seashells near a sunken ship',
          'A whale family swimming together through deep ocean waters',
          'A seahorse father carrying baby seahorses through kelp',
          'A playful dolphin leaping over crashing ocean waves',
          'A hermit crab finding a beautiful new shell on the beach',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A baby T-Rex hatching from a giant spotted egg',
          'A Triceratops family drinking from a prehistoric lake',
          'A Pterodactyl soaring high above a steaming volcano',
          'A Brontosaurus reaching for leaves in tall treetops',
          'A Stegosaurus playing in a jungle river with ferns',
          'Two friendly dinosaurs sharing a pile of tropical fruit',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A playful kitten chasing butterflies through a meadow',
          'A family of rabbits having a picnic under a tree',
          'A puppy splashing in puddles on a sunny afternoon',
          'A curious raccoon exploring a hollow log in the woods',
          'A mother duck leading her ducklings across a pond',
          'A hedgehog carrying a tiny mushroom through autumn leaves',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A rooster crowing on top of a bright red barn',
          'A mother hen watching baby chicks chase a ladybug',
          'A happy pig splashing in a mud puddle beside sunflowers',
          'A cow grazing peacefully in a field of wildflowers',
          'A horse galloping through a green meadow at sunrise',
          'A sheepdog herding fluffy sheep through a wooden gate',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate parrot guarding a treasure chest on the beach',
          'A young pirate captain steering a ship through waves',
          'A treasure map leading through a jungle to buried gold',
          'A friendly pirate crew dancing on deck under the stars',
          'A pirate ship sailing past a lighthouse at sunset',
          'A pirate monkey swinging from the mast with a banana',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A friendly robot watering flowers in a rooftop garden',
          'A tiny robot building a sandcastle at the beach',
          'A robot chef flipping pancakes in a futuristic kitchen',
          'A robot and a puppy playing fetch in a park',
          'A team of robots building a treehouse together',
          'A robot artist painting a portrait of the sunrise',
        ],
      },
      {
        id: 'circus', emoji: '🎪', shortName: 'Circus',
        prompts: [
          'A circus elephant balancing on a giant striped ball',
          'A juggling clown tossing pies under the big top',
          'A brave lion jumping through a hoop at the circus',
          'A trapeze artist swinging high above the circus crowd',
          'A circus seal balancing a ball on its nose on stage',
          'A magician pulling a rabbit from a sparkling top hat',
        ],
      },
      {
        id: 'arctic', emoji: '🧊', shortName: 'Arctic',
        prompts: [
          'A polar bear family sliding down a snowy hill together',
          'A baby penguin taking its first steps on the ice',
          'An arctic fox curled up in a cozy snow den',
          'A walrus sunbathing on a floating chunk of ice',
          'A snowy owl perched on an icicle watching the aurora',
          'A seal pup playing with a snowball near the ocean',
        ],
      },
    ],
  },
  // ─── Day 1 ───
  // Core: space, fantasy, vehicles | Rotating: bugs, superheroes, food | Wildcard: camping, garden
  {
    forYou: [
      'A majestic phoenix rising above a mountain at dawn',
      'A tiny kitten sleeping inside a giant fluffy slipper',
      'A rocket ship racing through an asteroid belt in space',
      'A penguin wearing a top hat trying to ride a skateboard',
      'A ladybug orchestra performing a concert on a mushroom stage',
      'A mermaid braiding seaweed into a crown under the waves',
    ],
    themes: [
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'An astronaut floating beside a ringed planet with moons',
          'A rocket ship blasting off from a moon crater base',
          'A friendly alien family having a picnic on Mars',
          'A space station orbiting Earth with stars all around',
          'A robot rover exploring rocky terrain on a distant planet',
          'A comet streaking past smiling planets in the solar system',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A unicorn drinking from a sparkling enchanted stream',
          'A fairy sprinkling stardust over a sleeping forest',
          'A baby dragon learning to blow its first tiny flame',
          'A gnome tending giant mushrooms in a magical garden',
          'A wizard owl casting spells from a tower window',
          'A phoenix perched on a crystal tree in a glowing cave',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A steam train crossing a tall bridge over a river valley',
          'A fire truck racing down a street with sirens blazing',
          'A hot air balloon floating over rolling green countryside',
          'A tugboat pulling a big ship into a busy harbor',
          'A race car zooming around a track past cheering fans',
          'A helicopter hovering above a mountain rescue scene',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A ladybug family living inside a hollowed-out acorn',
          'A caterpillar inching along a branch toward a leaf',
          'A butterfly emerging from a cocoon in morning sunlight',
          'A team of ants carrying a giant cookie crumb home',
          'A firefly lighting up a meadow on a summer evening',
          'A dragonfly resting on a lily pad in a calm pond',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A superhero cat soaring over a city skyline at sunset',
          'A team of kid heroes standing together on a rooftop',
          'A superhero dog with a cape rescuing a kitten',
          'A hero using ice powers to build an enormous ice castle',
          'A superhero robot protecting a playground from a storm',
          'A young hero discovering their superpower for the first time',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A chef mouse making a giant pizza in a tiny kitchen',
          'A stack of pancakes with a face made of berries',
          'A cupcake castle with frosting towers and candy windows',
          'A fruit orchestra with bananas playing the trombone',
          'A gingerbread family decorating their cookie house together',
          'A spaghetti monster sitting in a big bowl of pasta',
        ],
      },
      {
        id: 'camping', emoji: '⛺', shortName: 'Camping',
        prompts: [
          'A bear family roasting marshmallows around a campfire',
          'A tent pitched beside a mountain lake under the stars',
          'A raccoon sneaking a peek inside a camping backpack',
          'A family of owls watching campers from a pine tree',
          'A canoe floating on a calm lake at golden sunset',
          'A friendly deer visiting a campsite in the morning mist',
        ],
      },
      {
        id: 'garden', emoji: '🌸', shortName: 'Garden',
        prompts: [
          'A tiny fairy sleeping inside a blooming rose petal',
          'A bunny hopping through rows of tall sunflowers',
          'A frog sitting on a lily pad in a garden pond',
          'A bumblebee collecting nectar from a field of daisies',
          'A bird family nesting in a flowering cherry blossom tree',
          'A snail leaving a sparkly trail through a vegetable patch',
        ],
      },
    ],
  },
  // ─── Day 2 ───
  // Core: nature, ocean, dinosaurs | Rotating: fairy-tales, music, birds | Wildcard: school, knights
  {
    forYou: [
      'A giant tree with a whole tiny village built in its branches',
      'A baby otter floating on its back holding a starfish',
      'A knight riding a friendly dragon into a thunderstorm',
      'A squirrel trying to carry an acorn bigger than itself',
      'A music teacher octopus playing eight instruments at once',
      'A superhero hamster lifting a toy car above its head',
    ],
    themes: [
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A waterfall cascading into a pool surrounded by ferns',
          'A family of deer grazing in a misty morning forest',
          'A rainbow stretching over a valley after a rainstorm',
          'A squirrel gathering acorns beneath a huge oak tree',
          'A babbling brook winding through a field of wildflowers',
          'A fox family playing outside their den at dusk',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A clownfish family hiding among waving sea anemones',
          'A manta ray gliding gracefully over the ocean floor',
          'A jellyfish parade drifting through deep moonlit water',
          'A lobster exploring a coral cave filled with treasures',
          'A narwhal swimming beneath floating chunks of arctic ice',
          'A school of tropical fish swirling into a giant spiral',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A Velociraptor playing hide and seek in tall ferns',
          'An Ankylosaurus rolling into a ball on a hillside',
          'A dinosaur nursery with eggs hatching in warm sand',
          'A Parasaurolophus calling out across a misty swamp',
          'A Diplodocus stretching its neck over a river crossing',
          'A baby Triceratops chasing dragonflies in a clearing',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A princess riding a horse through an enchanted forest',
          'A tiny elf cobbler making shoes by moonlight',
          'Three little pigs building houses in a sunny village',
          'A magic beanstalk growing up into the fluffy clouds',
          'A frog prince sitting on a lily pad wearing a crown',
          'A sleeping princess in a tower covered in climbing roses',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A cat band performing on a rooftop under the stars',
          'A bear playing a grand piano in a concert hall',
          'A bird choir singing together on a power line at dawn',
          'A frog playing a banjo on a log by the river',
          'A mouse orchestra performing inside a hollow tree trunk',
          'A dancing elephant playing the trumpet at a jazz club',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'A toucan perched on a branch in a tropical rainforest',
          'A family of robins nesting in a backyard birdhouse',
          'An eagle soaring above snow-capped mountain peaks at dawn',
          'A peacock displaying its magnificent tail in a palace garden',
          'A hummingbird sipping nectar from a trumpet-shaped flower',
          'A group of flamingos standing together in a shallow lagoon',
        ],
      },
      {
        id: 'school', emoji: '📚', shortName: 'School',
        prompts: [
          'A classroom of animal students with a wise owl teacher',
          'A bunny reading a giant book in the school library',
          'A science experiment bubbling over in a school laboratory',
          'A school bus full of excited animals heading to class',
          'A mouse painting a masterpiece during art class',
          'A school play with animal actors performing on stage',
        ],
      },
      {
        id: 'knights', emoji: '⚔️', shortName: 'Knights',
        prompts: [
          'A brave knight riding a horse across a drawbridge',
          'A young squire polishing a suit of armor in a castle',
          'A knight and a dragon sharing a feast at a table',
          'A castle tournament with knights jousting in an arena',
          'A knight rescuing a kitten from the top of a tower',
          'A group of knights gathered around a round table planning',
        ],
      },
    ],
  },
  // ─── Day 3 ───
  // Core: space, animals, fantasy | Rotating: sports, jungle, farm | Wildcard: monsters, weather
  {
    forYou: [
      'A castle floating on a cloud with waterfalls pouring off edges',
      'A puppy curled up asleep next to a stuffed teddy bear',
      'A pirate ship flying through space between glowing planets',
      'A tortoise winning a race while a hare takes a nap',
      'A jungle monkey swinging between vines carrying a treasure map',
      'A snowman building a sandcastle on a sunny tropical beach',
    ],
    themes: [
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space dog wearing a helmet floating among the stars',
          'A lunar base with astronauts planting a garden on the moon',
          'A spaceship landing on a planet with two bright suns',
          'A constellation of animals glowing in the night sky',
          'An alien classroom on a planet with floating desks',
          'A space race between a rocket and a shooting star',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A family of otters holding hands while floating downstream',
          'A baby elephant spraying water from its trunk playfully',
          'A koala hugging a eucalyptus tree in the Australian bush',
          'A tortoise carrying a tiny bird on its shell',
          'A pair of pandas rolling down a grassy bamboo hill',
          'A red fox leaping over a fence in the countryside',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A mermaid sitting on rocks combing her hair at sunset',
          'A flying carpet soaring over a desert with pyramids below',
          'A troll guarding a stone bridge over a magical river',
          'A pixie riding a bumblebee through a field of poppies',
          'A magic mirror showing a faraway enchanted kingdom inside',
          'A centaur galloping through a meadow carrying a lantern',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'A bear scoring a goal in a forest soccer match',
          'A rabbit winning a medal at an animal track race',
          'A penguin ice skating gracefully on a frozen lake',
          'A frog doing a perfect dive into a swimming pool',
          'A kangaroo playing basketball with a group of friends',
          'A cat gymnast doing flips on a balance beam',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A lion pride resting under a giant baobab tree',
          'A gorilla family grooming each other in a clearing',
          'A chameleon blending in on a branch full of flowers',
          'A parrot flying over the jungle canopy at sunrise',
          'A baby elephant following its mother along a river trail',
          'A leopard lounging on a thick tree branch above a stream',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A baby lamb bouncing through a field of clover',
          'A farmer cat driving a tractor through golden wheat fields',
          'Ducklings paddling in a row across the farm pond',
          'A goat standing proudly on top of a hay bale',
          'A barn owl watching over the farmyard from the rafters',
          'A piglet and a puppy playing together in the hay',
        ],
      },
      {
        id: 'monsters', emoji: '👾', shortName: 'Monsters',
        prompts: [
          'A friendly furry monster reading bedtime stories to children',
          'A monster family having a picnic in a moonlit park',
          'A shy one-eyed monster hiding behind a giant lollipop',
          'A monster chef baking cookies in a wonky kitchen',
          'A group of baby monsters learning to roar for the first time',
          'A polka-dot monster having a tea party with stuffed animals',
        ],
      },
      {
        id: 'weather', emoji: '🌈', shortName: 'Weather',
        prompts: [
          'A cloud family watching a rainbow form after the rain',
          'A sun peeking through storm clouds over a cozy village',
          'A snowflake fairy dancing in a gentle winter snowfall',
          'A kite flying high in a breezy autumn wind',
          'A rainbow bridge connecting two mountains above a valley',
          'A friendly lightning bolt playing tag with rain clouds',
        ],
      },
    ],
  },
  // ─── Day 4 ───
  // Core: vehicles, nature, ocean | Rotating: superheroes, pirates, robots | Wildcard: arctic, circus
  {
    forYou: [
      'A treehouse city connected by rope bridges in a giant forest',
      'A baby deer sleeping in a bed of soft fallen leaves',
      'A submarine exploring a glowing underwater cave system',
      'An elephant trying to hide behind a tiny potted plant',
      'A pirate parrot teaching a robot how to say ahoy',
      'A fairy building a tiny house inside a hollow pumpkin',
    ],
    themes: [
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A double-decker bus driving through a bustling city street',
          'A submarine diving deep past a school of glowing fish',
          'A monster truck jumping over a row of old cars',
          'A sailboat racing across a lake on a windy day',
          'An ice cream truck parked at a sunny beach boardwalk',
          'A tractor plowing a field with birds following behind',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A beaver building a dam across a forest stream',
          'A field of sunflowers stretching toward the bright sun',
          'A mushroom village growing at the base of a big tree',
          'A butterfly resting on a dewy spiderweb at dawn',
          'A mountain goat standing on a rocky cliff edge proudly',
          'A river otter sliding down a muddy bank into water',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A giant squid exploring a deep ocean trench below',
          'A sea otter cracking a clam on its belly',
          'A coral reef bustling with fish of every shape',
          'A baby shark swimming beside its mother through kelp',
          'A sea lion colony basking on warm coastal rocks',
          'An anglerfish glowing in the dark depths of the ocean',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A superhero bunny leaping over tall buildings at night',
          'A hero with plant powers growing a forest in the city',
          'A flying superhero delivering presents to children everywhere',
          'A superhero team posing on top of a mountain peak',
          'A hero using super speed to rescue a runaway train',
          'A tiny superhero ant lifting a boulder over its head',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate captain looking through a telescope from the crow\'s nest',
          'A treasure island with palm trees and a hidden cave',
          'A pirate ship battle with cannons splashing in the sea',
          'A mermaid showing pirates the way to a secret island',
          'A pirate cat climbing the rigging of a tall ship',
          'A buried treasure chest glowing with jewels on the shore',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A robot dog playing in a futuristic city park',
          'A robot teacher writing equations on a floating chalkboard',
          'A small robot exploring a cave filled with crystals',
          'A robot band performing a concert on a space station',
          'A robot firefighter putting out flames with a water cannon',
          'A robot butterfly flying through a mechanical flower garden',
        ],
      },
      {
        id: 'arctic', emoji: '🧊', shortName: 'Arctic',
        prompts: [
          'A penguin colony sliding down an enormous glacier together',
          'An arctic hare hopping across a snow-covered tundra landscape',
          'A polar bear catching fish in an icy river stream',
          'A baby seal resting on a floating iceberg at sunset',
          'A snowy owl hunting over a frozen landscape at dusk',
          'An igloo village with smoke rising from tiny chimneys',
        ],
      },
      {
        id: 'circus', emoji: '🎪', shortName: 'Circus',
        prompts: [
          'A bear riding a unicycle across a tightrope at the circus',
          'A circus ringmaster announcing the show under bright spotlights',
          'Acrobatic monkeys performing somersaults high above the crowd',
          'A circus train pulling into a small town at dawn',
          'A strongman mouse lifting a barbell made of cheese wheels',
          'A clown car overflowing with silly animals tumbling out',
        ],
      },
    ],
  },
  // ─── Day 5 ───
  // Core: dinosaurs, space, animals | Rotating: food, bugs, music | Wildcard: garden, camping
  {
    forYou: [
      'A whale leaping out of the ocean with a city on its back',
      'A kitten wearing a tiny scarf napping beside a fireplace',
      'A dinosaur and an astronaut exploring a jungle planet together',
      'A llama wearing sunglasses driving a tiny convertible car',
      'A bug band playing instruments on a floating lily pad',
      'A knight teaching a dragon how to knit a scarf',
    ],
    themes: [
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A T-Rex trying to blow out birthday candles with tiny arms',
          'A dinosaur school with a Stegosaurus as the teacher',
          'A Brachiosaurus wearing a scarf in a snowy landscape',
          'A pack of Velociraptors playing tag in a fern forest',
          'An Iguanodon building a nest for its eggs on a hillside',
          'A friendly Spinosaurus fishing in a wide prehistoric river',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A cat astronaut planting a flag on a new planet',
          'A space train traveling along tracks between glowing stars',
          'An alien market on a planet with floating crystal buildings',
          'A space whale swimming through a nebula full of colors',
          'Astronaut kids playing zero-gravity soccer inside a space station',
          'A telescope on the moon pointing at a beautiful galaxy',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A meerkat family standing guard on a sandy hill together',
          'A chameleon changing patterns on a branch of autumn leaves',
          'A mama bear teaching cubs to catch fish in rapids',
          'A bunny warren with tunnels and rooms underground',
          'A sleepy sloth hanging upside down from a tall tree',
          'A pair of swans gliding across a misty morning lake',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A donut shop run by a family of cheerful mice',
          'A giant ice cream sundae with a cherry on top',
          'A vegetable garden where the veggies have tiny faces',
          'A sushi chef cat rolling maki on a bamboo mat',
          'A popcorn machine overflowing at a movie theater snack bar',
          'A birthday cake taller than the house it sits beside',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A beetle pushing a ball of dung up a tiny hill',
          'A praying mantis standing tall in a garden of roses',
          'A grasshopper leaping over blades of grass in a meadow',
          'A spider weaving an intricate web between two flowers',
          'A colony of bees building honeycomb inside a hollow tree',
          'A stag beetle standing proudly on a mossy fallen log',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A hedgehog playing a tiny violin under a streetlight',
          'A marching band of insects parading through the garden',
          'A whale singing a song deep in the dark ocean',
          'A squirrel drummer performing on acorn cap drums',
          'A music box ballerina spinning in a cozy bedroom',
          'A penguin chorus singing on an iceberg stage together',
        ],
      },
      {
        id: 'garden', emoji: '🌸', shortName: 'Garden',
        prompts: [
          'A wheelbarrow full of flowers in a cottage garden',
          'A caterpillar crawling through a maze of garden hedges',
          'A gnome fishing in a tiny garden pond at sunset',
          'A bird bath surrounded by blooming lavender bushes',
          'A family of ladybugs exploring a giant sunflower head',
          'A watering can pouring rainbows over a garden bed',
        ],
      },
      {
        id: 'camping', emoji: '⛺', shortName: 'Camping',
        prompts: [
          'A fox family gathered around a campfire telling stories',
          'A treehouse cabin high up in a forest of pine trees',
          'A child fishing from a dock on a quiet mountain lake',
          'An owl hooting from a branch above a glowing campsite',
          'A family of chipmunks packing supplies for a hiking trip',
          'A hammock strung between two trees under the stars',
        ],
      },
    ],
  },
  // ─── Day 6 ───
  // Core: fantasy, vehicles, nature | Rotating: birds, fairy-tales, sports | Wildcard: knights, school
  {
    forYou: [
      'A magical library where the books fly off shelves by themselves',
      'A baby penguin being tucked into bed by its parents',
      'A train racing across a bridge above a roaring waterfall',
      'A cat wearing a tiny helmet riding a skateboard downhill',
      'A flamingo ballet class practicing beside a sparkling lake',
      'A friendly robot walking a pack of dogs in the park',
    ],
    themes: [
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A witch stirring a bubbling cauldron of sparkling potion',
          'A crystal palace shimmering on top of a snowy mountain',
          'A friendly giant carrying a village on its shoulders gently',
          'A magic wand shooting stars across a moonlit sky',
          'An enchanted fountain that turns everything into flowers',
          'A fairy queen riding a dragonfly over an enchanted lake',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A biplane doing loop-the-loops above a county fair',
          'A school bus with wings flying above the clouds',
          'A garbage truck with a robot arm cleaning a city street',
          'A speedboat jumping waves near a tropical island shore',
          'A cable car ascending a steep mountain with a view',
          'A cement mixer truck spinning at a busy construction site',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A giant redwood forest with sunlight filtering through the canopy',
          'A tide pool filled with starfish and tiny crabs',
          'A chipmunk storing seeds inside a hollow tree trunk',
          'A meadow full of fireflies glowing on a summer night',
          'A mountain stream tumbling over mossy rocks and boulders',
          'A mother bird feeding worms to her chicks in a nest',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'A pelican scooping fish from the sea with its pouch',
          'A pair of lovebirds sitting together on a flowering branch',
          'A kingfisher diving into a river to catch a fish',
          'A nest of baby owls peeping out from a hollow tree',
          'A woodpecker tapping on a tall pine tree in the forest',
          'A flock of geese flying in formation across an orange sky',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A gingerbread house in a forest clearing with candy decorations',
          'A brave girl with a basket walking through a dark wood',
          'A golden goose sitting in a farmyard surrounded by villagers',
          'A pumpkin carriage rolling down a cobblestone path at midnight',
          'A mischievous cat wearing boots and a feathered hat',
          'A spinning wheel in a cozy tower room surrounded by yarn',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'A turtle and a hare at the starting line of a race',
          'A group of puppies playing a game of tug of war',
          'An octopus goalie blocking shots with all eight arms',
          'A monkey swinging from bar to bar in a gymnastics arena',
          'A hedgehog curled into a ball rolling down a bowling lane',
          'A surfing contest between a penguin and a sea otter',
        ],
      },
      {
        id: 'knights', emoji: '⚔️', shortName: 'Knights',
        prompts: [
          'A princess knight training with a wooden sword in the courtyard',
          'A castle being built by a team of friendly woodland creatures',
          'A knight on horseback crossing a field of wildflowers',
          'A royal banquet in a great hall with torches blazing',
          'A friendly dragon giving a knight a ride over the castle',
          'An armor shop with suits of armor lined up in a row',
        ],
      },
      {
        id: 'school', emoji: '📚', shortName: 'School',
        prompts: [
          'A frog teacher giving a geography lesson with a giant globe',
          'A school talent show with animals performing different acts',
          'A chemistry experiment creating a volcano of fizzy bubbles',
          'A hedgehog librarian organizing books on tall shelves',
          'A school field trip on a bus heading toward the mountains',
          'A playground with animal students playing on the swings',
        ],
      },
    ],
  },
  // ─── Day 7 ───
  // Core: ocean, dinosaurs, space | Rotating: jungle, farm, superheroes | Wildcard: weather, monsters
  {
    forYou: [
      'A lighthouse keeper whale guiding ships through a foggy night',
      'A bunny tucking in a row of tiny sleeping carrots',
      'A dinosaur explorer discovering a hidden cave full of crystals',
      'A pelican trying to swallow a fish much too big',
      'A jungle temple with vines growing over ancient stone animals',
      'A baker wizard decorating a cake with floating frosting stars',
    ],
    themes: [
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A pirate octopus guarding sunken treasure on the seabed',
          'A pod of dolphins racing alongside a sailing ship',
          'A manatee grazing on seagrass in a warm shallow bay',
          'A deep-sea diver discovering a hidden underwater city',
          'A crab orchestra playing music with shells on the beach',
          'A sailfish leaping out of the water at incredible speed',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A Triceratops decorating its horns with flowers and vines',
          'A dinosaur parade marching through a misty prehistoric valley',
          'A Pteranodon delivering mail to dinosaurs across the land',
          'A Stegosaurus building a cozy nest from giant fern fronds',
          'A T-Rex painting a picture using a branch as a brush',
          'A herd of dinosaurs migrating past an erupting volcano',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A moon base with greenhouses growing plants under glass domes',
          'An asteroid shaped like a heart floating past a spaceship',
          'A bear astronaut fixing a satellite high above the earth',
          'A space pirate ship sailing through a sparkling nebula',
          'A family of aliens watching a meteor shower from their porch',
          'A robot building a bridge between two small asteroids',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A tree frog clinging to a vine in a tropical rainstorm',
          'A family of toucans perched in a banana tree together',
          'A sloth hanging from a branch above a jungle waterfall',
          'A jaguar drinking from a still pool in the dense jungle',
          'A tribe of monkeys building a treehouse village together',
          'A giant anaconda coiled around a tree near the river',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A scarecrow in a cornfield with birds sitting on its hat',
          'A litter of kittens playing in the hay inside the barn',
          'A tractor parade down a dirt road at harvest time',
          'A beehive buzzing with activity beside a field of lavender',
          'A farm dog rounding up geese near the old stone wall',
          'A donkey carrying baskets of apples through an orchard',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A superhero owl patrolling the city under the full moon',
          'A team of animal heroes assembled at their secret headquarters',
          'A hero with magnet powers stopping a runaway shopping cart',
          'A superhero penguin sliding across ice to save the day',
          'A kid hero training with obstacle courses in a backyard',
          'A sidekick squirrel collecting clues in a detective case',
        ],
      },
      {
        id: 'weather', emoji: '🌈', shortName: 'Weather',
        prompts: [
          'A tornado of autumn leaves swirling above a pumpkin patch',
          'A cozy cottage in a blizzard with smoke from the chimney',
          'A double rainbow arching over a seaside fishing village',
          'A sun and moon sharing the sky during a peaceful eclipse',
          'Raindrops bouncing on umbrellas in a cheerful spring shower',
          'A snowman waving hello on the first day of winter',
        ],
      },
      {
        id: 'monsters', emoji: '👾', shortName: 'Monsters',
        prompts: [
          'A monster under the bed that is actually afraid of the dark',
          'A fluffy three-eyed monster learning to ride a bicycle',
          'A monster dentist gently checking another monster\'s big teeth',
          'A tiny monster and a big monster comparing their shadows',
          'A monster school bus picking up little monsters each morning',
          'A cuddly monster giving the biggest hug in the world',
        ],
      },
    ],
  },
  // ─── Day 8 ───
  // Core: animals, fantasy, vehicles | Rotating: pirates, food, bugs | Wildcard: circus, holidays
  {
    forYou: [
      'An ancient tree with a magical door leading to another world',
      'A duckling sleeping on a water lily in a quiet pond',
      'A pirate ship racing a whale through giant stormy waves',
      'A flamingo trying to eat spaghetti with its long curved beak',
      'A beetle circus act balancing on top of a spinning top',
      'An igloo café with penguins sipping warm cocoa inside',
    ],
    themes: [
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A hamster running on a wheel inside a cozy cage',
          'A group of meerkats peeking out from their burrow tunnels',
          'A cat and a dog sharing a sunny window seat nap',
          'A porcupine carefully tiptoeing through a field of balloons',
          'A family of wolves howling at the moon on a hilltop',
          'A chipmunk carrying a nut bigger than its own head',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A genie lamp sitting on a pile of sand and jewels',
          'A tree that grows candy instead of fruit in its branches',
          'A tiny dragon sleeping inside an eggshell bed of flowers',
          'A magic carpet race weaving through tall desert spires',
          'An enchanted suit of armor guarding a castle treasure room',
          'A mermaid city built of seashells and coral on the seafloor',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A rocket sled zooming across a frozen lake at top speed',
          'A ferry boat crossing a bay with dolphins swimming alongside',
          'A mail truck delivering packages to houses on a snowy road',
          'A vintage airplane doing a skywriting heart above a town',
          'A gondola gliding through a canal lined with old buildings',
          'A dump truck unloading a pile of autumn leaves at a park',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate crew finding a message in a bottle at sea',
          'A pirate hideout in a sea cave lit by glowing crystals',
          'A parrot navigator reading a treasure map on the deck',
          'A pirate ship docked at a tropical island with waterfalls',
          'A friendly octopus helping pirates pull up their anchor',
          'A pirate cooking a feast for the crew in the galley',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A bakery run by a team of hardworking woodland mice',
          'A taco truck parked at a fiesta with dancing animals',
          'A chocolate river flowing through a candy cane forest',
          'A group of vegetables running a race through the kitchen',
          'A waffle house shaped like a giant golden waffle',
          'A picnic spread on a blanket in a sunny wildflower meadow',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A monarch butterfly migration filling the sky with wings',
          'A tiny ant city built underground with tunnels and rooms',
          'A cricket playing its song on a warm summer evening',
          'A ladybug landing on a child\'s fingertip in a garden',
          'A dung beetle rolling its prize past a curious mouse',
          'A water strider skating across a calm forest puddle',
        ],
      },
      {
        id: 'circus', emoji: '🎪', shortName: 'Circus',
        prompts: [
          'A trapeze mouse flying through the air between platforms',
          'A circus parade with a marching band going through town',
          'A flea circus with tiny performers on a miniature stage',
          'A contortionist cat bending into a pretzel shape on stage',
          'A circus cannon launching a hamster into a safety net',
          'A popcorn cart at the circus entrance with a long queue',
        ],
      },
      {
        id: 'holidays', emoji: '🎄', shortName: 'Holidays',
        prompts: [
          'A reindeer team practicing takeoff on a snowy rooftop',
          'An Easter bunny hiding eggs in a garden of tulips',
          'A jack-o-lantern patch glowing under the harvest moon',
          'A Thanksgiving table set for a feast with a stuffed turkey',
          'Fireworks exploding over a lake on a summer celebration night',
          'A snowglobe village with tiny houses and a church inside',
        ],
      },
    ],
  },
  // ─── Day 9 ───
  // Core: nature, ocean, dinosaurs | Rotating: robots, music, jungle | Wildcard: camping, arctic
  {
    forYou: [
      'A volcano island with a waterfall flowing into a lagoon',
      'A baby fox yawning and stretching in a field of clover',
      'A submarine exploring an ancient sunken pirate ship on the seafloor',
      'A parrot trying to teach a fish how to talk',
      'A robot orchestra conductor leading instruments that play themselves',
      'A birthday party on a cloud with a rainbow slide down',
    ],
    themes: [
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A cave behind a waterfall with glowing moss on the walls',
          'A family of bears crossing a log bridge over a creek',
          'An ancient tree covered in colorful autumn leaves falling gently',
          'A sandcastle on the beach being built by the tide',
          'A coral reef visible through crystal-clear shallow ocean water',
          'A meadow of dandelion puffs blowing in the spring breeze',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A whale shark swimming through a cloud of tiny bubbles',
          'A pufferfish puffing up in surprise near a coral wall',
          'A family of penguins diving off an iceberg into water',
          'A starfish parade along the sandy ocean floor at night',
          'A swordfish racing past a school of surprised little fish',
          'An octopus playing drums on overturned buckets on the seafloor',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A Pachycephalosaurus headbutting a coconut off a palm tree',
          'A dinosaur campfire circle sharing stories under the stars',
          'A Plesiosaur surfacing from a lake near a volcano',
          'A Compsognathus chasing a dragonfly through tall ferns',
          'An Apatosaurus giving smaller dinosaurs rides on its back',
          'A dinosaur egg hunt with baby dinos searching a meadow',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A robot librarian shelving books in a huge futuristic library',
          'A tiny wind-up robot marching across a tabletop bravely',
          'A robot mechanic fixing another robot in a bright workshop',
          'A robot cat chasing a robot mouse through a house',
          'A giant friendly robot carrying children across a river safely',
          'A robot farmer harvesting vegetables on a space colony farm',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A jazz band of frogs performing on a riverboat stage',
          'A piano that plays itself in a grand ballroom',
          'A group of crickets forming a symphony in the grass',
          'A dolphin playing a harp made of seaweed and shells',
          'A music festival in a meadow with animal bands performing',
          'A drumming circle of bears in a forest clearing together',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A baby orangutan swinging from vine to vine above a river',
          'A waterfall in the jungle with parrots flying through mist',
          'A panther prowling along a fallen log over a stream',
          'A jungle tree covered in orchids and bromeliads blooming',
          'A group of elephants bathing in a jungle river pool',
          'A chameleon sitting on a flower that matches its pattern',
        ],
      },
      {
        id: 'camping', emoji: '⛺', shortName: 'Camping',
        prompts: [
          'A sleeping bag under the stars on a mountain hilltop',
          'A campfire with sparks floating up into the dark sky',
          'A bear cub investigating a cooler full of picnic food',
          'A rope bridge connecting two tree platforms in the forest',
          'A kayak pulled up on the shore of a crystal lake',
          'A tent glowing from a lantern inside on a rainy night',
        ],
      },
      {
        id: 'arctic', emoji: '🧊', shortName: 'Arctic',
        prompts: [
          'A narwhal pod swimming beneath the northern lights above',
          'A sled dog team racing across a vast snowy plain',
          'An arctic fox pouncing into the snow to find food',
          'A polar bear cub playing with its reflection in the ice',
          'A reindeer herd crossing a frozen river in wintertime',
          'A cozy cabin surrounded by snowdrifts under the aurora',
        ],
      },
    ],
  },
  // ─── Day 10 ───
  // Core: space, animals, fantasy | Rotating: birds, sports, fairy-tales | Wildcard: garden, knights
  {
    forYou: [
      'A floating island with a waterfall pouring into the clouds below',
      'A baby owl wearing oversized reading glasses on a branch',
      'An explorer ship sailing through a sea of glowing jellyfish',
      'A hippo doing ballet in a tutu on a tiny stage',
      'A sports stadium full of cheering woodland animals at a game',
      'A scarecrow coming to life to dance in a moonlit field',
    ],
    themes: [
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A penguin astronaut waddling on the surface of the moon',
          'A space garden growing giant vegetables on a space station',
          'A comet with a trail of sparkles zooming past a planet',
          'An alien pet shop on a colorful faraway planet',
          'A satellite beaming a rainbow signal back down to earth',
          'A space explorer mapping new stars on a glowing hologram',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A pangolin curled into a ball on a mossy forest floor',
          'A platypus swimming in a creek under overhanging eucalyptus',
          'A parrot sitting on a branch mimicking a singing bluebird',
          'A baby hippo taking its first swim in a warm river',
          'A snow leopard prowling across a rocky mountain ridge',
          'A group of prairie dogs popping out of their burrows',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A potion shop with glowing bottles lining the wooden shelves',
          'A cloud giant napping on a thundercloud above a village',
          'A fairy ring of mushrooms glowing softly in the moonlight',
          'A magic seed sprouting into a tree in a single moment',
          'A gryphon perched on a cliff overlooking a misty kingdom',
          'An enchanted music box that makes flowers bloom when opened',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'A robin pulling a worm from the ground after a rainstorm',
          'A puffin colony nesting on seaside cliffs above crashing waves',
          'A cockatoo dancing on a branch to unheard music',
          'An owl delivering a tiny letter to a woodland cottage',
          'A penguin and a seagull sharing fish on a rocky shore',
          'A swallow building a mud nest under the eaves of a barn',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'A panda bear doing a perfect headstand in a yoga class',
          'A team of dolphins playing water polo in the ocean',
          'A squirrel doing parkour across a playground obstacle course',
          'A badger bowling a strike at a forest bowling alley',
          'A cheetah and a gazelle in a friendly sprint race',
          'A group of turtles competing in a slow-motion relay race',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A wolf in grandma\'s clothing sitting up in a cozy bed',
          'A pair of magic slippers sparkling on a staircase step',
          'A swan princess gliding across a moonlit enchanted lake',
          'A troll counting gold coins under a mossy stone bridge',
          'A mirror on the wall with a mysterious face inside it',
          'A tiny thumb-sized girl sleeping inside a walnut shell',
        ],
      },
      {
        id: 'garden', emoji: '🌸', shortName: 'Garden',
        prompts: [
          'A secret garden hidden behind an old ivy-covered stone wall',
          'A tortoise munching on lettuce in a raised vegetable bed',
          'A hummingbird hovering beside a window box full of petunias',
          'A garden maze made of tall hedges with a fountain center',
          'A worm popping out of the soil in a freshly tilled garden',
          'A butterfly resting on a lavender bush in warm sunshine',
        ],
      },
      {
        id: 'knights', emoji: '⚔️', shortName: 'Knights',
        prompts: [
          'A knight planting flowers in a castle courtyard garden',
          'A pair of knights playing chess on a giant outdoor board',
          'A blacksmith forging a sparkling sword in a stone workshop',
          'A knight reading stories to village children by a campfire',
          'A royal messenger riding a horse through a forest path',
          'A castle kitchen with cooks preparing a giant feast',
        ],
      },
    ],
  },
  // ─── Day 11 ───
  // Core: vehicles, nature, ocean | Rotating: superheroes, farm, food | Wildcard: school, weather
  {
    forYou: [
      'A dragon carrying a castle on its back across a mountain range',
      'A mama cat carrying a kitten by the scruff across a stream',
      'A hot air balloon race above a patchwork of colorful farm fields',
      'A crab wearing a top hat doing a sideways dance on the beach',
      'A superhero farmer lifting a whole tractor with one hand',
      'A wizard penguin casting a spell on a frozen lake at dawn',
    ],
    themes: [
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A train winding through a mountain pass covered in wildflowers',
          'A paddleboat cruising down a lazy river past weeping willows',
          'A fire helicopter dropping water on a forest fire below',
          'A rickshaw pulled by a friendly elephant through a village',
          'A crane lifting a giant pumpkin onto a flatbed truck',
          'A tandem bicycle built for a bear and a rabbit riding together',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A crystal cave with stalactites dripping into an underground pool',
          'A field of poppies stretching toward distant blue mountains',
          'A salmon leaping up a waterfall during its upstream journey',
          'A hollow tree trunk serving as a home for a fox family',
          'A tide receding to reveal patterns of shells on the beach',
          'A spring meadow with baby animals emerging from their dens',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A hammerhead shark swimming through an underwater canyon below',
          'A sea cucumber crawling slowly across the sandy ocean floor',
          'A group of sea turtles nesting on a moonlit beach',
          'An electric eel glowing in a dark underwater cave passage',
          'A dolphin mother teaching her calf to leap above water',
          'A coral garden with seahorses weaving between the branches',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A superhero chef saving the day with a flying pizza shield',
          'A weather hero calming a tornado to protect a small town',
          'A hero duo riding a tandem bike to fight crime together',
          'A superhero kitten using yarn powers to catch a villain',
          'An underwater superhero protecting coral reefs from danger below',
          'A kid hero building a fortress of pillows for a battle',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A hayride wagon pulled by horses through golden autumn fields',
          'A mother goose leading goslings through a barnyard puddle',
          'A windmill turning slowly beside a field of ripe grain',
          'A barn cat napping on a sun-warmed bale of straw',
          'A rooster with magnificent tail feathers strutting around the coop',
          'A farmer bear harvesting pumpkins in a big patch field',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A smoothie volcano erupting with berries and whipped cream',
          'A lemonade stand run by a team of cheerful frogs',
          'A giant pretzel twisting itself into a knot on a plate',
          'A pizza delivery robot zipping through a futuristic city street',
          'A cereal bowl lake with a spoon boat sailing across it',
          'A cooking competition between a cat chef and a dog chef',
        ],
      },
      {
        id: 'school', emoji: '📚', shortName: 'School',
        prompts: [
          'A penguin professor teaching astronomy with a model solar system',
          'A school orchestra of baby animals rehearsing for a concert',
          'A spelling bee with animal contestants standing at podiums',
          'A craft table covered in glitter and paint during art class',
          'A fire drill with animal students lining up in the yard',
          'A show-and-tell where a bunny presents a giant carrot',
        ],
      },
      {
        id: 'weather', emoji: '🌈', shortName: 'Weather',
        prompts: [
          'A family of clouds with different expressions across the sky',
          'A field of pinwheels spinning in a gentle spring breeze',
          'A bear family watching a thunderstorm from their cozy cave',
          'An umbrella garden where every umbrella is a different pattern',
          'A puddle reflecting a perfect rainbow after a rain shower',
          'A hailstorm of gumballs bouncing on a village cobblestone road',
        ],
      },
    ],
  },
  // ─── Day 12 ───
  // Core: dinosaurs, space, animals | Rotating: bugs, pirates, robots | Wildcard: monsters, circus
  {
    forYou: [
      'A sky whale carrying a garden of flowers on its broad back',
      'A lamb resting its head on a fluffy cloud-shaped pillow',
      'A dinosaur stampede crossing a river with splashing everywhere',
      'A snail racing a turtle and both moving incredibly slowly',
      'A pirate robot with a hook hand steering a submarine',
      'A fairy godmother granting a wish to a tiny field mouse',
    ],
    themes: [
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A Spinosaurus catching fish in a wide jungle waterfall',
          'A friendly Ankylosaurus letting baby birds ride on its tail',
          'A dinosaur birthday party with a volcano cake centerpiece',
          'A Dilophosaurus dancing in the rain in a fern forest',
          'A Pterodactyl family nesting on a high rocky cliff face',
          'A baby dinosaur learning to walk beside its proud parent',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space lighthouse guiding ships through an asteroid field safely',
          'A planet entirely covered in cotton candy clouds above',
          'A hamster running inside a hamster wheel to power a rocket',
          'A space café floating in orbit with a view of earth',
          'An astronaut painting a picture while floating in zero gravity',
          'A constellation of fireflies forming animal shapes in space',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A beaver family building an elaborate dam across a stream',
          'A skunk family picking wildflowers in a dewy morning field',
          'A seal pup learning to swim in a sheltered ocean cove',
          'A mountain lion watching the sunrise from a high ledge',
          'A mouse family living inside a cozy boot by the fireplace',
          'A badger digging a tunnel system with multiple rooms underground',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A rhinoceros beetle lifting a leaf ten times its weight',
          'A walking stick insect perfectly camouflaged on a twig',
          'A moth drawn to the warm glow of a garden lantern',
          'A pill bug rolling into a ball on a mossy stone',
          'A damselfly hovering above a sunny garden brook at noon',
          'An ant queen in her underground throne room giving orders',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate school where young pirates learn to tie knots',
          'A ghostly pirate ship emerging from a foggy sea at night',
          'A pirate treasure room filled with jewels and golden coins',
          'A pirate and a mermaid exchanging gifts by the shore',
          'A crew of mouse pirates sailing a walnut shell boat',
          'A pirate island with a watchtower overlooking the entire sea',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A robot pet groomer washing and polishing a robot dog',
          'A tiny robot repairing a clock from inside its gears',
          'A robot playground with mechanical swings and digital slides',
          'A robot mail carrier delivering packages on a flying scooter',
          'A robot family cooking dinner together in their modern kitchen',
          'A robot explorer discovering ancient ruins in a dense jungle',
        ],
      },
      {
        id: 'monsters', emoji: '👾', shortName: 'Monsters',
        prompts: [
          'A monster barber giving another monster a silly new hairstyle',
          'A baby monster riding a tricycle down a cobblestone street',
          'A monster art class painting portraits of each other happily',
          'A friendly swamp monster helping a duck find its ducklings',
          'A monster sleepover with pillow forts and midnight snacks',
          'A woolly monster knitting a scarf from its own fur',
        ],
      },
      {
        id: 'circus', emoji: '🎪', shortName: 'Circus',
        prompts: [
          'A daredevil squirrel being launched from a tiny circus cannon',
          'A circus orchestra pit filled with musical woodland creatures',
          'A tightrope walking cat with a balancing parasol above',
          'A circus ticket booth decorated with lights and bright flags',
          'An elephant painting a picture with its trunk on stage',
          'A magician dove appearing from a puff of sparkling smoke',
        ],
      },
    ],
  },
  // ─── Day 13 ───
  // Core: fantasy, vehicles, nature | Rotating: music, jungle, birds | Wildcard: arctic, camping
  {
    forYou: [
      'A crystal palace inside a mountain with gems lighting every room',
      'A hedgehog family cuddled together under a pile of autumn leaves',
      'A viking ship sailing through an iceberg maze under the aurora',
      'A chicken crossing the road carrying a briefcase and wearing glasses',
      'A jungle vine swing contest between monkeys and parrots',
      'A pirate treasure map that leads to a garden of flowers',
    ],
    themes: [
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A witch\'s cottage with legs walking through a spooky swamp',
          'A rainbow bridge connecting a floating island to a mountaintop',
          'A shape-shifting fox sitting beside a magical forest pool',
          'A snow queen building an ice palace with a wave of hands',
          'An invisible cat leaving only pawprints in the fresh snow',
          'A wishing well with golden light rising out of its depths',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A zeppelin floating above a Victorian city with brick chimneys',
          'A dune buggy racing across sand dunes in a vast desert',
          'A glass-bottom boat floating over a vivid coral reef',
          'A snow plow clearing a mountain road after a big storm',
          'A vintage car driving along a coastal road at sunset',
          'A canal barge filled with flowers cruising through the countryside',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A volcanic hot spring surrounded by snow and pine trees',
          'A caterpillar chrysalis hanging from a branch about to open',
          'A field of bluebells stretching beneath ancient oak trees',
          'A badger sett with tunnels exposed in a cutaway view',
          'A desert oasis with palm trees and a crystal-clear spring',
          'A frozen waterfall with icicles catching the morning sunlight',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A rock band of dinosaurs performing on a volcanic stage',
          'A music tree with branches that play notes in the wind',
          'A beaver building a xylophone from logs of different sizes',
          'A lullaby bird singing the forest animals gently to sleep',
          'A marching band of toy soldiers parading through a playroom',
          'A DJ hedgehog spinning records at a forest dance party',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A vine bridge connecting two giant trees above the canopy',
          'A river otter family playing in a jungle waterfall pool',
          'A macaw flying through the jungle with the sun behind it',
          'A coiled python resting on a thick branch high above ground',
          'A baby gorilla playing with a butterfly in a clearing',
          'A hidden jungle temple covered in moss and flowering vines',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'A secretary bird strutting proudly across an African grassland',
          'A barn owl swooping silently over a field under the moon',
          'A blue jay perched on a snowy fence post in winter',
          'A parrot talking to its own reflection in a pond',
          'A crane standing on one leg in a shallow misty river',
          'A group of sparrows splashing together in a garden birdbath',
        ],
      },
      {
        id: 'arctic', emoji: '🧊', shortName: 'Arctic',
        prompts: [
          'A penguin postal service delivering fish to igloo mailboxes',
          'A polar bear fishing through a hole in the thick ice',
          'An arctic explorer dog sled team crossing a frozen landscape',
          'A baby walrus playing on a snowy beach with its mother',
          'An ice cave with crystals reflecting the northern lights inside',
          'A snowy hare with white fur hiding on a snowbank',
        ],
      },
      {
        id: 'camping', emoji: '⛺', shortName: 'Camping',
        prompts: [
          'A lantern-lit campsite at the edge of a forest lake',
          'A family of hedgehogs making s\'mores over a tiny fire',
          'A wooden dock stretching into a calm lake at sunrise',
          'A bird watcher with binoculars sitting in a treetop hide',
          'A camping stove cooking breakfast with steam rising into the pines',
          'A compass and map spread on a rock beside a trail',
        ],
      },
    ],
  },
  // ─── Day 14 ───
  // Core: ocean, dinosaurs, space | Rotating: sports, fairy-tales, farm | Wildcard: holidays, garden
  {
    forYou: [
      'A giant friendly tortoise carrying a whole village on its shell',
      'A baby seal pup nuzzling against its mother on the ice',
      'A volcano erupting with popcorn instead of lava into the sky',
      'A fish riding a bicycle through an underwater city street',
      'A fairy tale prince frog coaching a sports team of mice',
      'A tiny gnome operating a construction crane to build a birdhouse',
    ],
    themes: [
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A deep-sea submarine shining its light on a giant squid',
          'A pelican diving headfirst into the sea to catch fish',
          'A hermit crab parade along a colorful tropical beach shore',
          'A blue whale breaching the surface under a full moon',
          'A friendly otter cracking open a seashell on its belly',
          'A group of seahorses dancing together in a kelp forest',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A T-Rex trying to reach an itch on its back',
          'A Brontosaurus giving a piggyback ride to smaller dinosaurs',
          'A group of dinosaurs building a raft to cross a river',
          'A Triceratops using its horns to hang laundry on a line',
          'A Pterodactyl delivering a pizza box to a dinosaur below',
          'A peaceful dinosaur meadow with different species grazing together',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space bakery selling moon pies and star-shaped cookies',
          'A cat floating past a window on a space station',
          'An astronaut riding a comet through a colorful nebula',
          'A planet where everything grows upside down from the ground',
          'A space post office with rockets delivering letters to planets',
          'A giant crystal floating in space reflecting rainbow light everywhere',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'A polar bear curling team sliding stones on an icy rink',
          'A rabbit high jump competition at the woodland olympics',
          'A fish doing synchronized swimming in a coral reef arena',
          'A cricket match on a village green with animal spectators',
          'A mountain goat climbing competition up a rocky cliff face',
          'A skateboarding fox doing tricks at a forest skate park',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A tortoise and a hare resting together under a tree after racing',
          'A brave tailor mouse sewing a coat for a giant',
          'A enchanted rose glowing inside a glass dome on a table',
          'A pied piper leading a parade of dancing animals through town',
          'A magic porridge pot overflowing in a cottage kitchen',
          'A princess and a dragon reading together in a library tower',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A chicken coop with hens sitting proudly on their nests',
          'A corn maze with animals peeking over the tall stalks',
          'A farm market stand selling baskets of fresh picked fruit',
          'A border collie leading a sheep parade through a green valley',
          'A sunrise over a farm with a rooster on the fence post',
          'A mama pig reading a bedtime story to a litter of piglets',
        ],
      },
      {
        id: 'holidays', emoji: '🎄', shortName: 'Holidays',
        prompts: [
          'A gingerbread village with icing rooftops and gumdrop chimneys',
          'A Valentine\'s Day card being delivered by a hummingbird messenger',
          'An Easter egg painting workshop run by a family of bunnies',
          'A Fourth of July parade with a marching band of bears',
          'A harvest festival with a pumpkin pie eating contest',
          'A winter solstice bonfire with woodland animals gathered around',
        ],
      },
      {
        id: 'garden', emoji: '🌸', shortName: 'Garden',
        prompts: [
          'A scarecrow surrounded by a garden of blooming wildflowers',
          'A greenhouse full of tropical plants and a visiting toucan',
          'A garden pond with goldfish and a frog on a lily pad',
          'A potting shed with tools and flower pots on the shelves',
          'A garden gate covered in climbing roses leading to a meadow',
          'A vegetable patch with a tiny scarecrow made by children',
        ],
      },
    ],
  },
  // ─── Day 15 ───
  // Core: animals, fantasy, vehicles | Rotating: food, superheroes, bugs | Wildcard: knights, school
  {
    forYou: [
      'A magic carpet weaving through towers of a glowing crystal city',
      'A baby elephant holding a daisy in its trunk for its mother',
      'A race between a rocket car and a cheetah across a desert',
      'A seagull stealing a sandwich from a surprised picnicker',
      'A food fight between two teams of heroic kitchen utensils',
      'A polar bear trying to blend in at a tropical beach resort',
    ],
    themes: [
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A capybara sitting in a hot spring with birds on its head',
          'A wombat digging a burrow with its strong sturdy claws',
          'A kangaroo with a joey peeking out of its pouch curiously',
          'A peacock spider dancing to impress with its colorful fan',
          'A pack of wolves running through fresh snow in the moonlight',
          'A flying squirrel gliding between tall trees at twilight',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A djinn emerging from a golden lamp in a cloud of sparkles',
          'A living suit of armor polishing itself in a castle hallway',
          'A fairy market in the hollow of an enormous ancient tree',
          'A phoenix egg glowing with warmth in a nest of cinders',
          'A magic compass that always points toward hidden adventure',
          'A dragon hatchling chasing its own tail in a cave',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A flying car zooming above a futuristic city skyline',
          'A delivery van filled with balloons floating off the road',
          'A pedal boat shaped like a swan on a peaceful lake',
          'A mining cart racing through a gem-filled underground tunnel',
          'A horse-drawn carriage rolling through a snowy winter village',
          'A toy train winding around a Christmas tree on its track',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A pancake stack so tall it reaches through the kitchen ceiling',
          'A farmer\'s market with animal vendors selling fresh baked goods',
          'A candy factory with conveyor belts of sweets rolling along',
          'A sushi train circling around a tiny restaurant for animals',
          'A hot dog cart at a busy park with a squirrel vendor',
          'A pie cooling on a windowsill with a bird eyeing it',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A librarian superhero using book powers to save the day',
          'A hero with stretchy arms reaching across a canyon to help',
          'A superhero hideout disguised as a normal-looking tree house',
          'A kid hero with a shield made of a trash can lid',
          'A superhero panda using bamboo staffs to protect a village',
          'A cape-wearing rescue dog leading people out of a maze',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A jewel beetle sparkling in a beam of warm forest sunlight',
          'A caterpillar eating its way through a giant colorful leaf',
          'A mantis shrimp boxing match on the ocean floor reef',
          'A glowworm cave ceiling lit up like a starry night sky',
          'A weevil climbing a stalk of wheat taller than a tree',
          'A leaf cutter ant carrying a petal twice its own size',
        ],
      },
      {
        id: 'knights', emoji: '⚔️', shortName: 'Knights',
        prompts: [
          'A knight delivering invitations to a royal ball on horseback',
          'A castle drawbridge lowering over a moat full of friendly fish',
          'A jousting match between two knights on hobby horses',
          'A young page learning to be brave in the castle corridors',
          'A round table feast with roast turkey and fruit platters',
          'A knight\'s horse wearing flower garlands for a spring parade',
        ],
      },
      {
        id: 'school', emoji: '📚', shortName: 'School',
        prompts: [
          'A tortoise teacher slowly reading a story to excited students',
          'A science fair with animal students presenting their inventions',
          'A school art gallery opening with animal artists and their paintings',
          'A gym class with animals trying different sports for the first time',
          'A music room with instruments waiting for animal students to arrive',
          'A school garden project where students plant seeds in pots',
        ],
      },
    ],
  },
  // ─── Day 16 ───
  // Core: nature, ocean, dinosaurs | Rotating: robots, pirates, music | Wildcard: weather, monsters
  {
    forYou: [
      'A mushroom kingdom with tiny doors and windows carved into each cap',
      'A chipmunk wrapped in a leaf blanket dozing on a toadstool',
      'A kraken tentacle rising from the ocean beside a tiny rowboat',
      'A duck trying to use an umbrella but holding it upside down',
      'A robot pirate with a hook hand sailing a mechanical ship',
      'A group of fairies using dandelion puffs as hot air balloons',
    ],
    themes: [
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A petrified forest with stone trees standing in a desert',
          'A beaver dam creating a peaceful pond in a forest stream',
          'A field of clover with a four-leaf clover glowing in the center',
          'A mountain peak poking above a sea of morning clouds',
          'A coral-pink sand dune with desert flowers in bloom',
          'A moss-covered stone bridge arching over a forest creek',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A bioluminescent deep-sea creature glowing in the dark ocean',
          'A coral bleaching scene with fish trying to help the reef',
          'A sea dragon hiding among seaweed in a tidal pool',
          'A baby octopus learning to camouflage on the ocean floor',
          'A grouper fish hiding inside a shipwreck covered in barnacles',
          'A manta ray doing graceful flips near the ocean surface',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A dinosaur orchestra with each species playing a different instrument',
          'A Styracosaurus using its horns as a hat rack',
          'A dinosaur surfing a wave on a flat piece of bark',
          'A nest of baby Maiasaura chirping for their returning parent',
          'A Gallimimus race along the edge of a prehistoric beach',
          'A dinosaur art gallery with cave paintings on stone walls',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A robot sculptor chiseling a statue out of a block of metal',
          'A nanny robot reading a bedtime story to a child',
          'A robot submarine exploring underwater volcanic vents on the seafloor',
          'A robot bee pollinating flowers in a mechanical greenhouse',
          'A robot detective solving a mystery with a magnifying glass',
          'A robot rescue team pulling a stuck truck from the mud',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate shipwright building a new vessel at the docks',
          'A pirate map room with charts and compasses spread everywhere',
          'A pirate lookout in the crow\'s nest spotting land ahead',
          'A pirate island market with stalls selling exotic ocean goods',
          'A retired pirate tending a garden on a quiet island beach',
          'A pirate flag being raised at the top of a tall mast',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A songbird teaching baby birds to sing on a branch',
          'A musical waterfall where the droplets chime as they fall',
          'A grasshopper fiddler playing for dancing ants on a leaf',
          'A concert grand piano in a spotlight on a stage',
          'A street musician cat playing guitar under a warm lamppost',
          'A choir of frogs singing together on a moonlit pond',
        ],
      },
      {
        id: 'weather', emoji: '🌈', shortName: 'Weather',
        prompts: [
          'A gentle rain making a garden of flowers bloom open',
          'A sun dog forming a halo of light around the bright sun',
          'A fog rolling into a harbor with boats barely visible',
          'A snow angel being made by a child in fresh powder',
          'A wind carrying autumn leaves in a spiral above a town',
          'A frost fairy painting ice patterns on a window overnight',
        ],
      },
      {
        id: 'monsters', emoji: '👾', shortName: 'Monsters',
        prompts: [
          'A monster mailman delivering letters with its extra-long arms',
          'A group of monsters building a sandcastle on a beach',
          'A monster fire station with monster firefighters polishing the truck',
          'A tiny monster riding a snail through a dewy garden',
          'A monster baker decorating the tallest cake in the world',
          'A baby monster\'s first day at monster kindergarten',
        ],
      },
    ],
  },
  // ─── Day 17 ───
  // Core: space, animals, fantasy | Rotating: jungle, birds, sports | Wildcard: circus, arctic
  {
    forYou: [
      'A flying whale carrying a lantern through a starry night sky',
      'A nest of baby birds with their mouths wide open for food',
      'A spaceship powered by a hamster wheel zooming between galaxies',
      'A bear accidentally sitting on a tiny camping chair that breaks',
      'A jungle temple with a secret entrance behind a waterfall',
      'A snow globe containing an entire miniature bustling city inside',
    ],
    themes: [
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space zoo with alien animals in floating habitat bubbles',
          'An astronaut and an alien sharing lunch on a crater rim',
          'A space junkyard with old satellites and retired rocket parts',
          'A nebula shaped like a butterfly glowing in deep space',
          'A lunar rover doing donuts in the moon dust for fun',
          'A space elevator stretching from the earth into the stars',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A tapir family trotting along a forest trail at dusk',
          'A hermit crab choosing between several empty shells on the beach',
          'A family of geese crossing a road stopping all the cars',
          'A herd of wild horses galloping along a sandy beach shore',
          'A slow loris peeking out from behind a wide jungle leaf',
          'A litter of dalmatian puppies playing in a pile of leaves',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A floating library where books orbit like planets in space',
          'A tree spirit stepping out of an ancient gnarled oak tree',
          'A dream catcher glowing softly above a child sleeping peacefully',
          'A magical door in a hillside leading into a fairy kingdom',
          'A spell book flipping its own pages in a wizard tower',
          'A unicorn foal learning to make rainbows with its horn',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A poison dart frog sitting on a bright tropical leaf',
          'A jungle rope bridge swaying above a misty river valley',
          'A hornbill nesting in the hollow of a towering jungle tree',
          'A tapir cooling off in a muddy jungle watering hole',
          'A canopy walkway high above the lush jungle floor below',
          'A tiger cub batting at a dangling vine in the undergrowth',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'A bald eagle soaring over a wide river canyon at dawn',
          'A roadrunner sprinting across a desert trail past a cactus',
          'A snowy egret fishing in the shallow water of a marsh',
          'A kookaburra laughing on a branch in the Australian bush',
          'A wren building the tiniest nest in a garden hedge',
          'A murmuration of starlings forming shapes in the evening sky',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'A snow leopard skiing down a mountain slope at full speed',
          'A cricket team of grasshoppers playing on a field of grass',
          'An elephant playing tennis with its trunk as a racket',
          'A beaver building an ice hockey rink from frozen pond water',
          'A frog doing a perfect triple jump in a pond arena',
          'A penguin snowboarding off an icy cliff with a twist',
        ],
      },
      {
        id: 'circus', emoji: '🎪', shortName: 'Circus',
        prompts: [
          'A circus tent being raised by a team of strong elephants',
          'A fortune teller owl with a crystal ball at the fair',
          'A human cannonball being launched across the big top tent',
          'A circus poster artist painting a giant advertisement on canvas',
          'A trick-riding pony galloping in circles under sparkling lights',
          'A cotton candy machine spinning clouds of fluffy sugar',
        ],
      },
      {
        id: 'arctic', emoji: '🧊', shortName: 'Arctic',
        prompts: [
          'An ice fishing hole with a polar bear patiently waiting beside it',
          'A penguin toboggan team sliding down an icy slope together',
          'An aurora borealis painting the sky in green and purple',
          'A baby harp seal with big eyes lying on the snow',
          'A caribou migration stretching across a frozen arctic tundra',
          'An icebreaker ship pushing through thick sea ice up north',
        ],
      },
    ],
  },
  // ─── Day 18 ───
  // Core: vehicles, nature, ocean | Rotating: fairy-tales, farm, food | Wildcard: camping, garden
  {
    forYou: [
      'A tree with branches that grow different kinds of fruit on each one',
      'A cat sleeping on a stack of warm laundry from the dryer',
      'A sailboat caught in a whirlpool with dolphins circling to help',
      'A moose wearing water wings trying to swim in a kiddie pool',
      'A fairy-tale bakery making enchanted gingerbread cookies that dance',
      'A robot building the world\'s tallest sandcastle on the beach',
    ],
    themes: [
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A steam locomotive chugging through a snowy mountain tunnel',
          'A fishing boat bobbing in a harbor at sunrise',
          'A go-kart race around a track with animal drivers competing',
          'A moving van being loaded by a family of busy mice',
          'A lunar rover bouncing across the cratered surface of the moon',
          'A bus covered in flowers driving through a spring town parade',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A river delta splitting into channels seen from high above',
          'A family of otters playing on a log in a stream',
          'A volcanic island with lush green forests growing around the rim',
          'A spider building its web between two dewy morning ferns',
          'A canyon with layers of colorful rock exposed in the walls',
          'A wildflower super bloom covering an entire desert valley',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A sea horse race through a garden of colorful sea anemones',
          'A shipwreck on the seafloor becoming a home for reef fish',
          'A blue-ringed octopus hiding in a crevice of the coral',
          'A pod of orcas hunting together near an icy shore',
          'A sea urchin sitting in a tide pool with tiny fish',
          'A flying fish soaring over the waves in bright sunlight',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A seven-league boot sitting beside a cottage front door',
          'A talking mirror giving compliments to everyone who passes by',
          'A hen laying golden eggs in a cozy straw-filled barn nest',
          'A woodcutter sharing lunch with friendly forest animals at noon',
          'A magical fish granting wishes to a fisherman by the river',
          'A tiny house with a thatched roof deep in an enchanted wood',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A baby calf taking wobbly first steps in a green paddock',
          'A farmer owl planting seeds in neat rows at sunrise',
          'A litter of farm puppies tumbling in the hay barn',
          'A fruit orchard in full bloom with bees buzzing everywhere',
          'A milk pail being filled under a patient spotted cow',
          'A weathervane rooster spinning on top of a red barn roof',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A ramen bowl with a tiny village built on top of noodles',
          'A fruit punch fountain surrounded by party-going animal guests',
          'A bread bakery with loaves rising magically in a brick oven',
          'A carrot plane flying over a salad bowl landscape below',
          'An ice cream truck driving through a land made of desserts',
          'A fondue pot with animals dipping fruit on tiny forks',
        ],
      },
      {
        id: 'camping', emoji: '⛺', shortName: 'Camping',
        prompts: [
          'A bear family stargazing through a telescope at a campsite',
          'A canoe trip down a river lined with autumn-colored trees',
          'A campfire guitar sing-along with woodland animals gathering around',
          'A ranger station at the entrance to a national forest park',
          'A log cabin with a porch overlooking a peaceful mountain valley',
          'A nature journal open beside a pair of binoculars on grass',
        ],
      },
      {
        id: 'garden', emoji: '🌸', shortName: 'Garden',
        prompts: [
          'A rain barrel overflowing with water near a garden shed',
          'A trellis covered in climbing sweet peas with butterflies visiting',
          'A garden gnome fishing in a birdbath beside the front path',
          'A row of sunflowers taller than the fence in a backyard',
          'A garden bench under a wisteria arbor in full purple bloom',
          'A compost bin with earthworms peeking out of the rich soil',
        ],
      },
    ],
  },
  // ─── Day 19 ───
  // Core: dinosaurs, space, animals | Rotating: superheroes, bugs, robots | Wildcard: school, knights
  {
    forYou: [
      'A bonsai tree growing on a floating rock above a misty canyon',
      'A row of baby ducks sleeping in a line on a log',
      'A dinosaur knight riding into battle on a armored Triceratops',
      'An owl wearing a monocle reading a newspaper upside down',
      'A superhero bug team assembled on a leaf looking heroic',
      'A mermaid school where fish learn to read at tiny desks',
    ],
    themes: [
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A Velociraptor postal service delivering messages across the land',
          'A dinosaur spa where a Brachiosaurus gets a mud bath',
          'A T-Rex dentist checking the teeth of a nervous Stegosaurus',
          'A dinosaur playground with a Pterodactyl on the monkey bars',
          'An Allosaurus painting landscapes on a riverbank easel',
          'A Parasaurolophus blowing a musical note from its head crest',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space farmer growing crystals on an asteroid garden plot',
          'A spaceship made of recycled parts held together with tape',
          'An interstellar road trip with alien family in a space van',
          'A space weather station monitoring a solar storm approaching',
          'A baby alien taking its first steps on a new planet',
          'A space bridge connecting two neighboring planets with a walkway',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A red panda balancing on a branch while munching bamboo',
          'A fawn hiding in tall grass while its mother grazes nearby',
          'A colony of bats hanging upside down in a cave together',
          'A sea otter wrapping itself in kelp to sleep floating',
          'A tortoise family on a slow walk through a sunny meadow',
          'A woodpecker creating a perfect round hole in a birch tree',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A superhero artist painting murals that come to life magically',
          'A hero with the power to talk to all the animals',
          'A superhero training academy for young heroes in the clouds',
          'A nighttime patrol with a bat hero swooping over rooftops',
          'A superhero inventor building gadgets in a secret garage workshop',
          'A superhero team photo on the steps of city hall',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A honeybee waggle-dancing to tell friends where flowers are',
          'A cicada emerging from underground after a very long sleep',
          'A dung beetle astronomer looking at stars through a tiny telescope',
          'A mayfly enjoying its one perfect day in the sunshine',
          'A firefly lighting a path through a dark forest at night',
          'A butterfly pavilion with hundreds of wings of every pattern',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A robot archaeologist carefully brushing sand off ancient bones',
          'A robot circus performer juggling gears and bolts on stage',
          'A robot dentist gently checking a smiling child\'s teeth',
          'A tiny repair bot fixing a crack in a spaceship hull',
          'A robot street sweeper tidying a neighborhood in the morning',
          'A robot photographer snapping pictures of a sunset from a cliff',
        ],
      },
      {
        id: 'school', emoji: '📚', shortName: 'School',
        prompts: [
          'A dinosaur substitute teacher trying to fit behind the desk',
          'A school garden where students grow vegetables and herbs together',
          'A math class where a parrot solves equations on a blackboard',
          'A school race day with ribbons and medals for every animal',
          'A reading nook shaped like a castle in the school library',
          'A cooking class where bear students learn to bake bread',
        ],
      },
      {
        id: 'knights', emoji: '⚔️', shortName: 'Knights',
        prompts: [
          'A suit of armor that has flowers growing through every joint',
          'A castle moat with swans and a drawbridge being lowered',
          'A knight making friends with a baby dragon in a meadow',
          'A medieval marketplace bustling with villagers and wandering knights',
          'A herald trumpeter announcing the arrival of a royal procession',
          'A castle tower with a winding staircase and a view of the kingdom',
        ],
      },
    ],
  },
  // ─── Day 20 ───
  // Core: fantasy, vehicles, nature | Rotating: pirates, music, jungle | Wildcard: monsters, holidays
  {
    forYou: [
      'A waterfall that flows upward into a floating lake in the sky',
      'A puppy dreaming of bones with thought bubbles above its head',
      'A pirate ship and a viking longboat in a friendly sea race',
      'A cat stuck in a paper bag walking into walls',
      'A jungle band with monkeys on drums and toucans on maracas',
      'A snowman visiting the beach wearing sunglasses and a sun hat',
    ],
    themes: [
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A witch\'s broom closet full of enchanted sweeping brooms',
          'A cloud kingdom with palaces built from cumulus towers',
          'A time-traveling hourglass showing two different worlds inside it',
          'A dragon hoard of books instead of gold coins',
          'A magical paintbrush that brings everything it paints to life',
          'A fairy post office delivering letters by hummingbird express',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A pirate submarine with a periscope shaped like a telescope',
          'A flying saucer taxi picking up aliens at a bus stop',
          'A hot rod shaped like a giant roller skate with flames',
          'A bamboo raft floating down a lazy tropical jungle river',
          'A rescue helicopter winching a stranded hiker from a cliff',
          'A toy boat racing through puddles after a heavy rainstorm',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A bioluminescent bay glowing bright blue on a dark night',
          'A giant sequoia tree with a tunnel carved through its trunk',
          'A prairie dog town with lookout sentries scanning the grassland',
          'A geyser erupting with steam in a snowy volcanic landscape',
          'A coastal cliff with puffin burrows and crashing waves below',
          'A mangrove forest with roots reaching into the shallow water',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate birthday party on the deck of a ship',
          'A pirate pet shop selling parrots and monkeys by the dock',
          'A submarine pirate exploring a sunken city of gold',
          'A pirate crew playing cards during a calm night at sea',
          'A treasure chest being hauled up from the ocean depths',
          'A pirate lighthouse guiding ships to a secret hidden cove',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A treehouse recording studio with animal musicians laying tracks',
          'A singing mermaid accompanied by a seahorse harp player',
          'A bamboo wind chime orchestra playing in a mountain breeze',
          'An opera house filled with dressed-up penguin audience members',
          'A drum circle of woodland creatures in a forest glade',
          'A music box fairy spinning slowly on a velvet stage',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A family of gibbons swinging through the treetops at dawn',
          'An elephant herd following a trail to their watering hole',
          'A venus flytrap snapping at a curious fly in the jungle',
          'A treehouse village connected by rope bridges high up above',
          'A crocodile sunbathing on a riverbank with birds on its back',
          'A rare orchid blooming in a shaft of light in the jungle',
        ],
      },
      {
        id: 'monsters', emoji: '👾', shortName: 'Monsters',
        prompts: [
          'A monster fashion show with creatures modeling silly outfits',
          'A friendly yeti making snow angels on a mountain peak',
          'A monster lunchbox with slimy sandwiches and eyeball grapes',
          'A monster band practicing in a garage made of cardboard boxes',
          'A two-headed monster arguing about which way to walk',
          'A monster circus with a strongman lifting rubber ducks',
        ],
      },
      {
        id: 'holidays', emoji: '🎄', shortName: 'Holidays',
        prompts: [
          'A New Year\'s Eve countdown with animal party guests cheering',
          'A heart-shaped hot air balloon floating on Valentine\'s Day',
          'A leprechaun guarding a pot of gold at the rainbow end',
          'A dragon boat race during a summer festival on the river',
          'A trick-or-treat parade of animals in funny costumes',
          'A Diwali festival with lanterns and fireworks over a village',
        ],
      },
    ],
  },
  // ─── Day 21 ───
  // Core: ocean, dinosaurs, space | Rotating: birds, sports, fairy-tales | Wildcard: arctic, weather
  {
    forYou: [
      'A mechanical whale with gears visible swimming through the deep ocean',
      'A tiny mouse tucked into a matchbox bed with a thimble pillow',
      'A dragon boat race through a canyon of towering red cliffs',
      'A flamingo standing on one leg on top of a bouncing trampoline',
      'A sports day for birds with an egg-and-spoon race event',
      'A gingerbread man running away from a kitchen full of bakers',
    ],
    themes: [
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A cleaner fish picking parasites off a grateful shark',
          'A sea anemone garden waving gently in the ocean current',
          'A message in a bottle washing ashore on a deserted island',
          'A lionfish displaying its fancy striped fins over the reef',
          'A deep-sea anglerfish luring curious creatures with its light',
          'A cuttlefish changing patterns to match the sandy seafloor',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A Triceratops garden with plants growing between its frills',
          'A dinosaur science lab with a T-Rex in a lab coat',
          'A Brachiosaurus serving as a living bridge for smaller creatures',
          'A Stegosaurus carving ice sculptures with its tail plates',
          'A baby Pteranodon learning to fly with wobbly first attempts',
          'A dinosaur bakery with a Velociraptor decorating a layer cake',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space whale migration through a field of colorful nebulae',
          'An astronaut growing a sunflower that reaches beyond the dome',
          'A black hole shaped like a giant cosmic drain with stars',
          'A space museum with exhibits from every planet in the galaxy',
          'A moon village with bubble domes and connecting glass tunnels',
          'A rocket-powered sled racing along an icy moon surface',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'A lyrebird mimicking the sounds of the forest perfectly',
          'A flamingo flock forming a heart shape in a pink lagoon',
          'A hawk circling high above a golden wheat field below',
          'A tiny chickadee singing on a snow-covered branch in winter',
          'A secretary bird stomping on a toy snake in the grass',
          'A pelican teaching its chick to fish from a pier',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'A hamster running in a wheel powering a tiny scoreboard',
          'A bunny doing a slam dunk at a forest basketball court',
          'A seal balancing a soccer ball on its nose at practice',
          'A team of ants rowing a tiny boat in a puddle regatta',
          'A bear cub learning to ice skate on a frozen pond',
          'A horse show jumping over fences in a grand arena',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A giant sleeping at the top of a beanstalk cloud castle',
          'A fairy godmother turning a pumpkin into a golden carriage',
          'A dancing princess wearing out her shoes at a secret ball',
          'A clever fox outsmarting a crow for a piece of cheese',
          'A magic table that sets itself with a wonderful feast',
          'A snow queen riding a sleigh pulled by arctic foxes',
        ],
      },
      {
        id: 'arctic', emoji: '🧊', shortName: 'Arctic',
        prompts: [
          'A seal pup sunbathing on an iceberg under a pale sun',
          'An arctic tern flying the longest migration route over the sea',
          'A musk ox herd huddled together in a blowing snowstorm',
          'A polar bear sliding on its belly across the flat ice',
          'An ice palace carved from a glacier with frozen furniture inside',
          'A beluga whale pod playing beneath the arctic ice shelf',
        ],
      },
      {
        id: 'weather', emoji: '🌈', shortName: 'Weather',
        prompts: [
          'A tornado made entirely of colorful autumn leaves swirling around',
          'A sun shower with rain falling while the sun still shines',
          'A snowflake so big you can see its crystal structure clearly',
          'A lightning storm illuminating a castle on a distant hilltop',
          'A morning dew drop on a blade of grass reflecting everything',
          'A cloud painting the sky in shades of pink at sunset',
        ],
      },
    ],
  },
  // ─── Day 22 ───
  // Core: animals, fantasy, vehicles | Rotating: farm, food, superheroes | Wildcard: garden, circus
  {
    forYou: [
      'A dragon sleeping curled around a mountain like a scaly necklace',
      'A baby raccoon washing a tiny toy in a stream carefully',
      'A chariot race through a coliseum cheered on by woodland creatures',
      'A puffer fish puffed up and rolling down a sandy hill',
      'A farm Stand selling magic beans next to regular vegetables',
      'A scientist owl mixing potions that create tiny weather systems',
    ],
    themes: [
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A chameleon family portrait where everyone is a different pattern',
          'An armadillo rolling into a ball while friends watch curiously',
          'A mother duck teaching ducklings to dive underwater for food',
          'A gecko climbing a glass window with its sticky toe pads',
          'A herd of elephants trumpeting at a watering hole together',
          'A pair of sea otters holding paws while floating in water',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A magic garden where the flowers sing when the sun rises',
          'A wardrobe door opening into a winter wonderland with a lamppost',
          'A flying ship with butterfly wing sails cruising above clouds',
          'An enchanted loom weaving tapestries that tell the future',
          'A genie granting a wish to a surprised fisherman on shore',
          'A dragon egg incubator in a cozy mountain cave nursery',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A houseboat with a garden on the roof floating downriver',
          'A tiny airplane doing barrel rolls in a bright blue sky',
          'A horse-drawn fire engine racing through a Victorian-era town',
          'A snowcat grooming a ski slope on a crisp winter morning',
          'A riverboat casino floating down the Mississippi at twilight',
          'A covered wagon crossing the prairie with mountains ahead',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A dairy cow wearing a flower crown in a spring meadow',
          'A hay maze with farm animals peeking through the corridors',
          'A farm pond with geese and cattails swaying in the breeze',
          'A turkey strutting proudly with its tail feathers fully fanned',
          'A milking parlor with contented cows and a busy farmer',
          'A sunflower field with a tractor cutting through the middle',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A popcorn machine shaped like a spaceship popping corn everywhere',
          'A soup pot big enough to be a swimming pool for mice',
          'A salad garden where the lettuce and tomatoes are building sized',
          'A donut rolling down a hill being chased by hungry squirrels',
          'A taco truck run by a team of enthusiastic chihuahuas',
          'A honey jar with bees having a party on the rim',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A superhero with the power to grow plants instantly anywhere',
          'A hero cat using its nine lives to save the city',
          'A superhero teacher using chalk powers to stop a villain',
          'A retired superhero walking their dog in the park peacefully',
          'A team of baby heroes crawling into action wearing tiny capes',
          'A superhero with bubble powers trapping villains in giant bubbles',
        ],
      },
      {
        id: 'garden', emoji: '🌸', shortName: 'Garden',
        prompts: [
          'A Japanese zen garden with raked sand and stepping stones',
          'A garden shed workshop with a hedgehog building a birdhouse',
          'A hanging basket overflowing with trailing flowers and strawberries',
          'A topiary garden with bushes shaped like different zoo animals',
          'A cactus garden in a desert courtyard with hummingbird visitors',
          'A window box herb garden with a cat watching from inside',
        ],
      },
      {
        id: 'circus', emoji: '🎪', shortName: 'Circus',
        prompts: [
          'A clown school where baby clowns learn to juggle pies',
          'A high-wire act with a mouse balancing a tiny umbrella',
          'A circus elephant doing a headstand to applause from the crowd',
          'A ringmaster penguin in a top hat introducing the next act',
          'A sword swallowing act with rubber swords and a nervous hamster',
          'A circus carousel spinning with hand-painted wooden animal riders',
        ],
      },
    ],
  },
  // ─── Day 23 ───
  // Core: nature, ocean, dinosaurs | Rotating: bugs, robots, pirates | Wildcard: camping, school
  {
    forYou: [
      'A floating lantern festival with thousands of lights above a river',
      'A kitten peeking out from inside a cozy knitted mitten',
      'A submarine racing a swordfish through an underwater canyon',
      'A goose chasing a terrified mailman down a country road',
      'A robot insect collecting mechanical flowers in a metal garden',
      'A cowboy riding a friendly dinosaur across a dusty desert plain',
    ],
    themes: [
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A cenote with crystal water and jungle vines hanging down',
          'A field of lavender stretching to the horizon at golden hour',
          'A glacier calving into the ocean with a massive splash',
          'A family of foxes playing in a field of fresh snow',
          'A tidal flat at low tide with thousands of tiny crabs',
          'A cherry blossom tree with petals falling like pink snow',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A nautilus shell spiraling perfectly in the deep blue water',
          'A kelp forest swaying like an underwater jungle below',
          'A sea star regenerating a lost arm on a rocky outcrop',
          'A blowfish inflating itself to surprise a passing fish',
          'A leatherback turtle migrating across the vast open ocean',
          'A school of sardines forming a bait ball to confuse predators',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A dinosaur talent show with each species doing something special',
          'A Pachycephalosaurus having a friendly headbutting contest with friends',
          'A baby Sauropod standing next to an egg it just hatched from',
          'A Therizinosaurus using its long claws to pick fruit gently',
          'A prehistoric beach scene with dinosaurs building sand castles',
          'A dinosaur library with towering shelves and tiny reading nooks',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A flea market run by actual fleas selling tiny wares',
          'A centipede trying on shoes at a shoe store patiently',
          'A lightning bug writing its name in the night sky',
          'An atlas moth with wings that look like snake heads',
          'A dung beetle Olympics with beetles rolling balls to the finish',
          'A web-building competition between three artistic spiders in a garden',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A robot weather forecaster pointing at a holographic weather map',
          'A robot dance crew performing breakdancing moves in a plaza',
          'A tiny robot fixing a leaky pipe inside a wall',
          'A robot zoo with mechanical animals in natural-looking habitats',
          'A robot ice cream truck serving cold treats in the park',
          'A robot tree planter replanting a forest one seedling at a time',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate costume contest with every crew member dressed up',
          'A pirate campfire on a beach with the ship anchored nearby',
          'A mermaid pirate captain commanding a pearl-encrusted ship at sea',
          'A pirate rowing a dinghy through a swamp full of fireflies',
          'A treasure vault inside a volcano with booby traps everywhere',
          'A pirate tattoo parlor on the dock with an octopus artist',
        ],
      },
      {
        id: 'camping', emoji: '⛺', shortName: 'Camping',
        prompts: [
          'A moose visiting a campsite and eating from a bird feeder',
          'A zip line through the forest canopy above a rushing river',
          'A cozy lean-to shelter built from sticks and pine branches',
          'A bald eagle circling above a mountain campsite at dawn',
          'A family of skunks raiding a cooler at an empty campsite',
          'A night sky with the Milky Way visible over a tent',
        ],
      },
      {
        id: 'school', emoji: '📚', shortName: 'School',
        prompts: [
          'A robot teacher giving a lesson on how gears work',
          'A school aquarium with students pressing their noses to the glass',
          'A recess soccer game between teams of different animal students',
          'A class photo with all the animal students smiling on risers',
          'A school art room with clay sculptures drying on every shelf',
          'A school campout on the playground with tents and a bonfire',
        ],
      },
    ],
  },
  // ─── Day 24 ───
  // Core: space, animals, fantasy | Rotating: music, jungle, birds | Wildcard: knights, monsters
  {
    forYou: [
      'A lighthouse made of crystal shining a rainbow beam across the sea',
      'A piglet sleeping in a teacup next to a warm scone',
      'An asteroid mining ship cracking open a gem-filled space rock',
      'A peacock trying to squeeze through a regular-sized doorway',
      'A concert of jungle animals with a waterfall backdrop on stage',
      'A mail carrier dragon delivering packages to cottages from the sky',
    ],
    themes: [
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space greenhouse with plants growing in zero gravity bubbles',
          'A planet covered entirely in a vast sparkling ocean',
          'A comet ice cream stand selling frozen treats in orbit',
          'A space school bus shuttle taking alien kids to school',
          'An astronaut discovering friendly microbes through a space microscope',
          'A binary star system with two suns setting on a planet',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A narwhal pod surfacing through a gap in the arctic ice',
          'A family of raccoons washing their food in a stream',
          'A baby giraffe trying to reach its first tall tree leaf',
          'A panda bear rolling downhill in a bamboo forest playfully',
          'A mother hen counting her chicks as they follow behind her',
          'An axolotl smiling in a pond full of water plants',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A potion garden growing magical herbs under a crescent moon',
          'A sentient castle that can walk on chicken-leg foundations',
          'A fortune-telling cat reading tea leaves at a cozy table',
          'A magical forge where a dwarf shapes a glowing enchanted sword',
          'A winged horse stable high up in the clouds with hay',
          'A crystal cave where wishes echo and bounce off the walls',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A ballet of butterflies performing on a stage of flower petals',
          'A sea shanty choir of walruses singing on a rocky shore',
          'A one-man-band beetle playing every instrument at once',
          'A vinyl record shop run by a music-loving owl in town',
          'A rainstick orchestra performing during an actual rainstorm',
          'A kitten pressing random piano keys making unexpected beautiful music',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A mother jaguar carrying her cub across a jungle stream',
          'A termite mound towering above the surrounding jungle like a castle',
          'A fig tree with monkeys and parrots sharing its fruit',
          'A caiman floating motionless in a swamp with only eyes showing',
          'A jungle observatory built in the tallest tree canopy above',
          'A herd of capybaras relaxing in a warm jungle hot spring',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'A shoebill stork staring intensely from a papyrus swamp',
          'A bird of paradise displaying its spectacular feathers to impress',
          'A swift flying at incredible speed through a narrow canyon',
          'An ibis wading through shallow marshland looking for food',
          'A nest-building competition between different bird species in spring',
          'A parrot kindergarten with baby parrots learning to talk',
        ],
      },
      {
        id: 'knights', emoji: '⚔️', shortName: 'Knights',
        prompts: [
          'A knight errant helping a lost kitten find its way home',
          'A castle siege with catapults launching pumpkins over the walls',
          'A knighting ceremony in a great hall with stained-glass windows',
          'A dragon and a knight playing a board game together peacefully',
          'A castle pantry stocked with barrels of honey and wheels of cheese',
          'A knight camping under the stars with a loyal horse nearby',
        ],
      },
      {
        id: 'monsters', emoji: '👾', shortName: 'Monsters',
        prompts: [
          'A monster school bus driver with extra arms for safety',
          'A garden of monster flowers with funny faces and wiggly stems',
          'A monster inventor building a friendship machine in their workshop',
          'A bedtime monster reading itself to sleep with a nightlight',
          'A monster talent show with tap dancing and silly impressions',
          'A three-headed monster arguing about which flavor of ice cream',
        ],
      },
    ],
  },
  // ─── Day 25 ───
  // Core: vehicles, nature, ocean | Rotating: sports, fairy-tales, farm | Wildcard: weather, holidays
  {
    forYou: [
      'A giant tortoise island with a tiny village on its mossy shell',
      'A group of hedgehog babies curled up together in a leaf nest',
      'A rocket-powered bicycle jumping over the Grand Canyon',
      'A woodpecker accidentally knocking on someone\'s front door instead of a tree',
      'A fairy-tale ship sailing on a river of melted chocolate',
      'A wizard accidentally turning himself into a rubber duck',
    ],
    themes: [
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A monorail gliding above a futuristic city with green rooftops',
          'A rowboat full of puppies crossing a calm sunny lake',
          'A tow truck rescuing a stuck ice cream van from mud',
          'A sleigh pulled by huskies racing across a frozen landscape',
          'A yacht anchored in a turquoise cove with snorkelers swimming',
          'A vintage motorcycle with a sidecar driving down a country lane',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A coral atoll seen from above forming a ring in the ocean',
          'A Venus flytrap snapping shut on a surprised cartoon fly',
          'A tide pool at sunset with a hermit crab exploring it',
          'A field of wheat rippling in waves under the wind',
          'A cave system with an underground river flowing through it',
          'A redwood forest floor covered in clover and tiny mushrooms',
        ],
      },
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A whale calf learning to breach by copying its mother',
          'A sea cucumber slowly inching across the sandy ocean bottom',
          'A sea otter mom carrying her pup on her belly lazily',
          'A moray eel peeking out from its coral hideaway cautiously',
          'A dugong grazing on seagrass in a warm tropical bay',
          'A decorator crab wearing shells and seaweed as a disguise',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'A rabbit archery competition in a forest clearing at dawn',
          'A dolphin and seal beach volleyball match by the shore',
          'A mole cricket weightlifting competition underground in a tunnel',
          'A snail racing championship with cheering crowd of garden bugs',
          'A bear playing catch with a salmon using its bare paws',
          'A frog long-jump contest over a series of lily pads',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A magic lamp hidden in a pile of junk in a cave',
          'A castle on a cloud reachable only by a golden staircase',
          'A brave mouse facing a sleeping cat to get the cheese',
          'A magic hat that creates anything you imagine wearing it',
          'A fairy ring of toadstools glowing in a dark forest clearing',
          'A prince turned into a bear fishing in a mountain stream',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A harvest moon rising huge and orange over a corn field',
          'A llama and an alpaca comparing hairdos over a fence',
          'A farm cat balancing on a thin fence rail at sunset',
          'An apple press squishing apples into cider with juice flowing',
          'A pig family posing for a family portrait in the barnyard',
          'A hay bale maze with excited children running through it',
        ],
      },
      {
        id: 'weather', emoji: '🌈', shortName: 'Weather',
        prompts: [
          'A rainbow ending in a puddle full of reflected colors',
          'A tree bending in the wind during a wild thunderstorm',
          'A sunny meadow after rain with everything sparkling and fresh',
          'A heat mirage creating a shimmering lake on a desert road',
          'A frost covering every leaf and twig of a garden in white',
          'A sea fog rolling in to blanket a quiet fishing village',
        ],
      },
      {
        id: 'holidays', emoji: '🎄', shortName: 'Holidays',
        prompts: [
          'A polar express train heading to the north pole at night',
          'An advent calendar house with tiny doors opening one by one',
          'A spring festival with maypole dancers and flower crowns',
          'A harvest corn dolly standing in a freshly cleared wheat field',
          'A lantern walk through a winter forest on the longest night',
          'A summer fair with a Ferris wheel and cotton candy stands',
        ],
      },
    ],
  },
  // ─── Day 26 ───
  // Core: dinosaurs, space, animals | Rotating: food, superheroes, bugs | Wildcard: circus, arctic
  {
    forYou: [
      'A volcano with a cozy restaurant built inside the crater rim',
      'A fawn sleeping among wildflowers with a butterfly on its nose',
      'A space pirate dinosaur steering a rocket through an asteroid belt',
      'A caterpillar doing a handstand on a blade of grass proudly',
      'A food truck festival with superhero chefs competing for the crown',
      'A grandfather clock that is actually a portal to a magical world',
    ],
    themes: [
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A dinosaur museum where the exhibits come alive at night',
          'A Parasaurolophus musical ensemble playing a prehistoric symphony',
          'A T-Rex trying to make its bed with its short arms',
          'A dinosaur detective searching for clues with a magnifying glass',
          'A cozy Ankylosaur den decorated with ferns and smooth stones',
          'A Pterodactyl air mail service delivering letters across the valley',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'A space campfire on an asteroid with marshmallows floating nearby',
          'A zero-gravity swimming pool shaped like a floating water sphere',
          'A space race between an alien scooter and a rocket skateboard',
          'A cosmic jellyfish floating through deep space trailing light',
          'A space treehouse orbiting a small moon with a rope ladder',
          'An alien farmer harvesting glowing fruit on a distant planet',
        ],
      },
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A manatee bumping into a glass-bottom boat and looking confused',
          'A group of meerkats doing synchronized standing on a sand dune',
          'A baby penguin sliding on ice for the first time ever',
          'A sleeping fox curled up with its bushy tail as a blanket',
          'A spider monkey hanging by its tail reaching for a banana',
          'A mother swan with cygnets riding safely on her broad back',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A spaghetti bridge engineering contest between animal teams',
          'A cheese cave with wheels of cheese aging on wooden shelves',
          'A fruit stand shaped like a pineapple on a tropical road',
          'A cooking show where a lobster is the host and judge',
          'A bento box with tiny edible landscapes arranged inside it',
          'A bubble tea shop with bears blowing giant tapioca bubbles',
        ],
      },
      {
        id: 'superheroes', emoji: '🦸', shortName: 'Heroes',
        prompts: [
          'A superhero whose cape is made of living butterflies fluttering',
          'A villain turning good and joining the hero team reluctantly',
          'A superhero pet rescue operation at a flooding river',
          'A hero with magnet boots walking upside down on a ceiling',
          'A sidekick hamster keeping watch from a tiny observation tower',
          'A superhero award ceremony on the steps of a grand building',
        ],
      },
      {
        id: 'bugs', emoji: '🐛', shortName: 'Bugs',
        prompts: [
          'A butterfly garden with dozens of species resting on flowers',
          'A hercules beetle strongman competition on a fallen log stage',
          'A ladybug school bus picking up tiny larvae from leaf stops',
          'A termite queen being fanned by workers in her royal chamber',
          'A moth landing softly on a windowsill drawn to candlelight',
          'An inchworm measuring leaves and twigs in a garden carefully',
        ],
      },
      {
        id: 'circus', emoji: '🎪', shortName: 'Circus',
        prompts: [
          'A circus tent at night with stars shining through the canvas',
          'A trained flea jumping through tiny flaming hoops on stage',
          'A circus parade entering town with a brass band leading',
          'A trapeze cat performing a triple somersault to amazed gasps',
          'A clown painting its face in front of a backstage mirror',
          'A balancing act with a tower of animals standing on each other',
        ],
      },
      {
        id: 'arctic', emoji: '🧊', shortName: 'Arctic',
        prompts: [
          'A snow fort built by penguins with an ice flag on top',
          'An arctic research station with a polar bear peering in the window',
          'A frozen lake with a pattern of cracks forming a star shape',
          'A family of ptarmigans blending into a snowy hillside seamlessly',
          'A dogsled team resting at a checkpoint with a warm stove',
          'An ice cave with frozen waterfalls and icicle chandeliers inside',
        ],
      },
    ],
  },
  // ─── Day 27 ───
  // Core: fantasy, vehicles, nature | Rotating: robots, pirates, music | Wildcard: garden, camping
  {
    forYou: [
      'A giant jellyfish floating above a sleeping city like a lantern',
      'A bunny nestled inside a hollowed-out bread loaf like a bed',
      'A dragon and a knight having a snowball fight in the mountains',
      'A chameleon at a paint store unable to decide on a color',
      'A robot pirates versus robot ninjas showdown on a rooftop',
      'A tiny door at the base of a tree leading to a fairy bakery',
    ],
    themes: [
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A bookshop where every book is a portal to its own world',
          'A constellation dragon made of stars flying across the night sky',
          'A witch riding a flying mortar through a thunderstorm bravely',
          'A magic quill writing a story that acts itself out',
          'An underwater fairy kingdom in a coral reef palace',
          'A sleeping dragon being used as a warm hillside for grazing sheep',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'An amphibious car driving from the road directly into a lake',
          'A wind-powered land yacht sailing across a flat salt desert',
          'A balloon-powered go-kart launched from a homemade ramp',
          'A penny-farthing bicycle ridden by a gentleman frog in a top hat',
          'A camper van parked on a cliff overlooking the crashing ocean',
          'A treehouse elevator made from an old bucket and a pulley',
        ],
      },
      {
        id: 'nature', emoji: '🌿', shortName: 'Nature',
        prompts: [
          'A slot canyon with light beams streaming down the narrow walls',
          'A tundra landscape with caribou and wildflowers in brief summer',
          'A rocky seashore with waves crashing and spray flying high',
          'A mushroom patch after rain with steam rising from the soil',
          'A desert tortoise walking past a blooming saguaro cactus',
          'A rolling hillside of heather in bloom stretching to the horizon',
        ],
      },
      {
        id: 'robots', emoji: '🤖', shortName: 'Robots',
        prompts: [
          'A robot orchestra tuning up for a concert in a theater',
          'A tiny cleaning robot polishing a giant marble floor spotless',
          'A robot lifeguard on a beach tower scanning the ocean waves',
          'A robot tailor sewing a custom suit for a penguin client',
          'A robot gardener trimming a topiary hedge into a heart shape',
          'A robot explorer discovering a new species of mechanical butterfly',
        ],
      },
      {
        id: 'pirates', emoji: '🏴‍☠️', shortName: 'Pirates',
        prompts: [
          'A pirate fleet approaching a dragon-guarded island at sunset',
          'A underwater pirate cave accessible only at low tide',
          'A pirate carpenter repairing the hull of the ship on the beach',
          'A pirate star chart used for navigating by the night sky',
          'A first mate parrot squawking orders to the pirate crew',
          'A pirate feast on a beach with a bonfire and music',
        ],
      },
      {
        id: 'music', emoji: '🎵', shortName: 'Music',
        prompts: [
          'A river xylophone where water flows over tuned stones making music',
          'A spider playing a web like a harp in the moonlight',
          'A woodwind ensemble of squirrels playing acorn-cap flutes together',
          'A disco ball hanging from a tree at a forest dance party',
          'A music-powered train that runs on the rhythm of its band',
          'A lullaby bird perched on a cradle singing a baby to sleep',
        ],
      },
      {
        id: 'garden', emoji: '🌸', shortName: 'Garden',
        prompts: [
          'A fairy garden built in a broken flower pot with mossy paths',
          'A moonflower opening its white petals under the evening stars',
          'A garden sundial covered in creeping thyme with bees visiting',
          'A pea shoot tendril curling around a bamboo garden stake',
          'A bird feeder busy with a queue of different colorful songbirds',
          'A child\'s garden plot with a handmade painted sign in front',
        ],
      },
      {
        id: 'camping', emoji: '⛺', shortName: 'Camping',
        prompts: [
          'A trailhead sign pointing to a mountain summit in the distance',
          'A cooking tripod over a fire with a pot of stew bubbling',
          'A pack of gear spread out on a tarp before a big hike',
          'A night hike with headlamps illuminating the path through trees',
          'A mountain goat watching hikers from a boulder above the trail',
          'A camp breakfast of eggs and toast sizzling on a portable stove',
        ],
      },
    ],
  },
  // ─── Day 28 ───
  // Core: ocean, dinosaurs, space | Rotating: jungle, birds, sports | Wildcard: school, knights
  {
    forYou: [
      'An island that is actually a giant sleeping sea turtle',
      'A tiny mouse family living in a dollhouse behind the walls',
      'A chariot pulled by seahorses racing through an underwater coliseum',
      'An ostrich with its head stuck in a bucket and bumping into things',
      'A jungle bird talent show on a vine-draped stage',
      'A friendly monster running a lemonade stand for trick-or-treaters',
    ],
    themes: [
      {
        id: 'ocean', emoji: '🐙', shortName: 'Sea Life',
        prompts: [
          'A whale song echoing through the deep ocean reaching other whales',
          'A seahorse couple dancing together in a swirl of bubbles',
          'A barnacle colony on the hull of a ship seen underwater',
          'A mermaid teaching a school of fish to swim in formation',
          'A sea turtle returning to the beach where it was born',
          'An underwater volcano creating a new island that pokes above water',
        ],
      },
      {
        id: 'dinosaurs', emoji: '🦕', shortName: 'Dinosaurs',
        prompts: [
          'A dinosaur architect designing a nest out of sticks and mud',
          'A Therizinosaurus scratch post where dinosaurs sharpen their claws',
          'A baby Triceratops playing peek-a-boo behind a giant fern leaf',
          'A dinosaur hot spring spa with Brachiosaurus soaking in the water',
          'A raptor relay race through a prehistoric obstacle course',
          'A cozy dinosaur cave home with stone furniture and leaf curtains',
        ],
      },
      {
        id: 'space', emoji: '🚀', shortName: 'Space',
        prompts: [
          'An alien family portrait in front of their crater home',
          'A space dolphin leaping between the rings of a giant planet',
          'A comet tail being surfed by an adventurous astronaut',
          'A space observatory dome under a galaxy full of bright stars',
          'A robot repair shop floating in the middle of outer space',
          'A meteorite crashing into a moon and creating a new lake',
        ],
      },
      {
        id: 'jungle', emoji: '🦁', shortName: 'Jungle',
        prompts: [
          'A butterfly sanctuary in a jungle clearing with thousands of wings',
          'A jungle river ferry run by a hippo captain and crew',
          'A carnivorous pitcher plant with curious frogs peering inside',
          'A howler monkey calling from the top of the tallest tree',
          'A jungle marketplace where animals trade fruit and shiny stones',
          'A firefly-lit jungle path leading to a hidden crystal pool',
        ],
      },
      {
        id: 'birds', emoji: '🐦', shortName: 'Birds',
        prompts: [
          'An ostrich burying its head in the sand with tail feathers showing',
          'A pelican storing a comically large fish in its bill pouch',
          'A weaver bird crafting an elaborate hanging nest from grass',
          'A cassowary walking through a rainforest with its helmet crest',
          'A migration of cranes flying over a mountain range at dawn',
          'A baby chick hatching from an egg in a warm nest',
        ],
      },
      {
        id: 'sports', emoji: '⚽', shortName: 'Sports',
        prompts: [
          'An otter water slide race down a muddy riverbank slope',
          'A praying mantis martial arts class in a dojo of leaves',
          'A beetle drag race on a straight track of a smooth log',
          'A fish doing hurdles over coral formations in a reef race',
          'A gopher mini-golf course with tunnels going underground between holes',
          'A mountain goat rock-climbing competition on a sheer cliff face',
        ],
      },
      {
        id: 'school', emoji: '📚', shortName: 'School',
        prompts: [
          'A school inventor fair with students showing off their creations',
          'A library reading hour with animal students sitting in a circle',
          'A school lunch cafeteria run by a team of friendly bears',
          'A graduation ceremony for a class of woodland animal students',
          'A school astronomy club meeting at night with a big telescope',
          'A classroom terrarium with a gecko mascot watching the lesson',
        ],
      },
      {
        id: 'knights', emoji: '⚔️', shortName: 'Knights',
        prompts: [
          'A castle garden with a hedge maze and a hidden treasure',
          'A knight teaching their horse to do tricks in the stable',
          'A royal kitchen with cooks preparing a dragon-shaped bread loaf',
          'A castle rampart walk with a view of the entire countryside',
          'A jester entertaining the royal court with juggling and jokes',
          'A squire cleaning out the stables with helpful stable mice',
        ],
      },
    ],
  },
  // ─── Day 29 ───
  // Core: animals, fantasy, vehicles | Rotating: fairy-tales, farm, food | Wildcard: monsters, weather
  {
    forYou: [
      'A sky city floating above the clouds connected by rainbow bridges',
      'A koala hugging a pillow like it would hug a tree branch',
      'A fleet of paper boats racing down a rain gutter stream',
      'A seagull riding on top of a pelican like a tiny jockey',
      'A fairy-tale tea party with woodland creatures as the guests',
      'A ninja cat sneaking past sleeping guard dogs in a museum',
    ],
    themes: [
      {
        id: 'animals', emoji: '🐾', shortName: 'Animals',
        prompts: [
          'A honey badger fearlessly facing a much bigger animal down',
          'A mother crocodile gently carrying babies in her mouth',
          'A group of flamingos forming a circle in a pink lagoon',
          'A prairie vole couple grooming each other in their burrow',
          'A mountain goat kid bouncing between rocks on a steep slope',
          'A reef octopus squeezing into a tiny crevice to hide',
        ],
      },
      {
        id: 'fantasy', emoji: '🧚', shortName: 'Fantasy',
        prompts: [
          'A snow globe that contains an actual living miniature world inside',
          'A feather quill that writes poems by itself when dipped in ink',
          'A moonbeam staircase leading up to a palace among the stars',
          'A talking mirror reflecting a magical version of the room',
          'An ancient map that changes its paths depending on who reads it',
          'A lamp that hatches tiny firefly fairies when rubbed gently',
        ],
      },
      {
        id: 'vehicles', emoji: '🚂', shortName: 'Vehicles',
        prompts: [
          'A steam train arriving at a platform in a snowstorm',
          'A paddleboard shaped like a giant leaf floating down a river',
          'A futuristic school bus with wings folding in for landing',
          'A caterpillar-tracked expedition vehicle crossing a glacier at dawn',
          'A canal boat decorated with flowers cruising past stone bridges',
          'A soapbox racer rolling down a hill at a neighborhood derby',
        ],
      },
      {
        id: 'fairy-tales', emoji: '📖', shortName: 'Fairy Tales',
        prompts: [
          'A cottage made entirely of sweets in a forest clearing',
          'A magic harp playing itself in a giant\'s treasury room',
          'A brave tin soldier standing guard on a child\'s windowsill',
          'A glass slipper sparkling on the steps of a grand palace',
          'A singing bone telling the truth from deep inside a cave',
          'A kindly grandmother spinning straw into gold at a wheel',
        ],
      },
      {
        id: 'farm', emoji: '🐄', shortName: 'Farm',
        prompts: [
          'A farmhouse kitchen with fresh pies cooling on the windowsill',
          'A duck pond with a tiny island and a willow tree',
          'A shearing day with fluffy sheep lined up patiently waiting',
          'A farm sunset with animals heading back to the warm barn',
          'A goat yoga class in a sunny farmyard paddock',
          'A harvest wagon loaded high with pumpkins heading to market',
        ],
      },
      {
        id: 'food', emoji: '🍕', shortName: 'Food',
        prompts: [
          'A waffle iron pressing out perfect golden waffles for breakfast',
          'A kitchen garden to table dinner set among the growing vegetables',
          'A hot chocolate stand in a snowy park with marshmallow toppings',
          'A berry picking expedition with baskets overflowing in a field',
          'A dim sum restaurant with animals pushing steamer carts around',
          'A giant wedding cake being assembled by a team of mouse bakers',
        ],
      },
      {
        id: 'monsters', emoji: '👾', shortName: 'Monsters',
        prompts: [
          'A monster Olympics with events like longest roar and biggest stomp',
          'A friendly sea monster giving boat rides to village children',
          'A monster family portrait with everyone showing their best scary face',
          'A baby monster learning to fly with tiny stubby wings',
          'A monster treehouse built to be extra big for monster sleepovers',
          'A fuzzy monster in a bathrobe drinking cocoa by the fire',
        ],
      },
      {
        id: 'weather', emoji: '🌈', shortName: 'Weather',
        prompts: [
          'A raindrop race down a window pane with a child watching',
          'A perfectly round halo of light surrounding the winter moon',
          'A spring thunderstorm with frogs celebrating in the puddles',
          'A gentle snow falling on a village where everyone is sleeping',
          'A morning mist rising from a lake as the sun comes up',
          'A windmill spinning in a strong breeze on a grassy hilltop',
        ],
      },
    ],
  },
];

/**
 * Returns today's content. Deterministic: all users see the same
 * content on the same day. Cycles every 30 days at UTC midnight.
 */
export function getDailyContent(): DailyContent {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % DAILY_CONTENT.length;
  return DAILY_CONTENT[dayIndex];
}
