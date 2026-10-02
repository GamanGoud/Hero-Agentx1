// Level and Comic Issue configurations

export const ISSUES = [
  {
    id: 1,
    title: "Issue #1: The Rookie Shift",
    subtitle: "Downtown Core - Collateral Debut",
    theme: "downtown",
    duration: 55, // seconds
    minApproval: 35,
    wageRate: 15.00, // $/hour base
    hazardSpawnInterval: 3.2,
    hazardTypes: ['window', 'fire', 'debris'],
    chopperInterval: 14.0,
    bgColor: '#38b6ff',
    skyColor: '#68c5ff',
    roadColor: '#3a3a4c',
    heroDialogue: [
      "FEAR NOT, CITIZENS! CAPTAIN CALAMITY HAS ARRIVED!",
      "TAKE THAT, REARVIEW MIRROR OF INJUSTICE!",
      "I MEANT TO SMASH THAT MAILBOX FOR FREEDOM!",
      "VICTORY IS ONLY A FEW CRUSHED CARS AWAY!"
    ],
    villainDialogue: [
      "HA! YOU MISSED ME BY A MILE, CALAMITY!",
      "ENJOY CLEANING UP YOUR HERO'S MESS, CHUMP!"
    ],
    introPanels: [
      {
        heroSpeaker: "Captain Calamity",
        text: "Budge, my faithful squire! Today marks your first day protecting the city at my side! ...Mostly by walking ten paces behind me with that roll of duct tape.",
        sidekickReaction: "Sweating"
      },
      {
        heroSpeaker: "Budge (Sidekick)",
        text: "Uh, Captain, did you just throw an entire fire hydrant through the mayor's office window?",
        sidekickReaction: "Shocked"
      },
      {
        heroSpeaker: "Captain Calamity",
        text: "A necessary sacrifice for JUSTICE! Now patch it up before the Action 9 Chopper films my approval rating dropping!",
        sidekickReaction: "Ready"
      }
    ]
  },
  {
    id: 2,
    title: "Issue #2: Suburban Splashdown",
    subtitle: "Maple Grove Estates - Barbecues & Broken Fences",
    theme: "suburbia",
    duration: 65,
    minApproval: 45,
    wageRate: 16.50,
    hazardSpawnInterval: 2.8,
    hazardTypes: ['window', 'fire', 'debris', 'wire'],
    chopperInterval: 12.0,
    bgColor: '#72d67a',
    skyColor: '#58b6ff',
    roadColor: '#454558',
    heroDialogue: [
      "THAT WEED-WHACKER WAS HARBORING VILLAINY!",
      "WHO PUTS A SWIMMING POOL DIRECTLY IN MY FLIGHT PATH?!",
      "I DEFENDED THIS PATIO UMBRELLA WITH MY LIFE!"
    ],
    villainDialogue: [
      "YOU CHARGED RIGHT INTO MY GNOME MINEFIELD!",
      "WATCH THE BARBECUE GO BOOM, CALAMITY!"
    ],
    introPanels: [
      {
        heroSpeaker: "Captain Calamity",
        text: "The villain fled into the peaceful suburbs! I shall neutralize him with a devastating sonic-bellyflop!",
        sidekickReaction: "Shocked"
      },
      {
        heroSpeaker: "Budge (Sidekick)",
        text: "Wait! Those are Mrs. Higgins' prized hydrangeas and flammable gas grills!",
        sidekickReaction: "Sweating"
      },
      {
        heroSpeaker: "Captain Calamity",
        text: "Grab the juice cartons, Budge! Put out those barbecue infernos before Chad Chiseled reports my homeowner association rating!",
        sidekickReaction: "Ready"
      }
    ]
  },
  {
    id: 3,
    title: "Issue #3: Boardwalk Bedlam",
    subtitle: "Sunburst Pier - Cotton Candy & Crushed Coasters",
    theme: "boardwalk",
    duration: 75,
    minApproval: 55,
    wageRate: 18.00,
    hazardSpawnInterval: 2.4,
    hazardTypes: ['window', 'fire', 'debris', 'wire', 'sign'],
    chopperInterval: 10.5,
    bgColor: '#ff9233',
    skyColor: '#ffb366',
    roadColor: '#6d4c41',
    heroDialogue: [
      "THE FERRIS WHEEL WAS SPINNING ILLEGALLY FAST!",
      "POWDERED SUGAR IS NO MATCH FOR MY HEAT VISION!",
      "I SAVED THAT CORNDOG FROM EVIL!"
    ],
    villainDialogue: [
      "TRY DODGING MY HIGH-VOLTAGE COTTON CANDY CANNON!",
      "THE WHOLE PIER IS COLLAPSING, HERO!"
    ],
    introPanels: [
      {
        heroSpeaker: "Captain Calamity",
        text: "Doctor Disaster is hijacking the funhouse! I must suplex this neon clown sign to stop him!",
        sidekickReaction: "Shocked"
      },
      {
        heroSpeaker: "Budge (Sidekick)",
        text: "Please no! Shards of neon glass are raining everywhere and the electric cables are spitting sparks!",
        sidekickReaction: "Sweating"
      },
      {
        heroSpeaker: "Captain Calamity",
        text: "Wrench those wires and sweep the popcorn, Higgins! The press is doing a live prime-time broadcast!",
        sidekickReaction: "Ready"
      }
    ]
  },
  {
    id: 4,
    title: "Issue #4: Industrial Incompetence",
    subtitle: "Ironworks & Chemical Docks - High Voltage Mayhem",
    theme: "industrial",
    duration: 85,
    minApproval: 60,
    wageRate: 20.00,
    hazardSpawnInterval: 2.1,
    hazardTypes: ['window', 'fire', 'debris', 'wire', 'sign'],
    chopperInterval: 9.5,
    bgColor: '#607d8b',
    skyColor: '#455a64',
    roadColor: '#263238',
    heroDialogue: [
      "THAT STEAM PIPE LOOKED AT ME FUNNY!",
      "A MERE CHEMICAL EXPLOSION CANNOT TARNISH MY SHIELD!",
      "LOOK OUT BELOW, MOLTEN STEEL IS GOOD FOR THE COMPLEXION!"
    ],
    villainDialogue: [
      "PRESSURE'S RISING, CALAMITY! 500 PSI OF PURE CHAOS!",
      "YOUR SIDEKICK CANNOT POSSIBLY TAPE ALL THESE LEAKS!"
    ],
    introPanels: [
      {
        heroSpeaker: "Captain Calamity",
        text: "The villain's secret hideout! I just roundhouse-kicked the main chemical pressure valve!",
        sidekickReaction: "Shocked"
      },
      {
        heroSpeaker: "Budge (Sidekick)",
        text: "Captain, that valve was labeled 'DO NOT KICK UNDER ANY CIRCUMSTANCES' in glowing hazard letters!",
        sidekickReaction: "Sweating"
      },
      {
        heroSpeaker: "Captain Calamity",
        text: "Words cannot stop me, Budge, because I never learned to read warnings! Keep that approval above 60% or city hall cancels my franchise!",
        sidekickReaction: "Ready"
      }
    ]
  },
  {
    id: 5,
    title: "Issue #5: Rooftop Showdown",
    subtitle: "The Calamity Clash Finale - Skyline in Peril",
    theme: "rooftop",
    duration: 95,
    minApproval: 70,
    wageRate: 25.00,
    hazardSpawnInterval: 1.8,
    hazardTypes: ['window', 'fire', 'debris', 'wire', 'sign'],
    chopperInterval: 8.0,
    bgColor: '#1a237e',
    skyColor: '#283593',
    roadColor: '#212121',
    heroDialogue: [
      "THIS IS IT, DOCTOR DISASTER! TIME FOR THE MEGA-SMASH!",
      "OOPS! I CRUSHED THE CITY HALL CLOCK TOWER!",
      "BEHOLD MY NEWEST MOVE: UNCHECKED KINETIC DESTRUCTION!"
    ],
    villainDialogue: [
      "I'LL DROP MY DOOM-ZEPPELIN DIRECTLY ONTO YOU!",
      "WATCH AS THE ENTIRE CITY ACCUSES YOU OF TREASON!"
    ],
    introPanels: [
      {
        heroSpeaker: "Captain Calamity",
        text: "The final showdown atop the Mega-Corp Tower! The Action 9 Chopper has four camera drones trained on us!",
        sidekickReaction: "Shocked"
      },
      {
        heroSpeaker: "Budge (Sidekick)",
        text: "If we drop below 70% approval, the Mayor is sending the police to impound our utility belts!",
        sidekickReaction: "Sweating"
      },
      {
        heroSpeaker: "Captain Calamity",
        text: "Then work those rubber gloves like never before, Higgins! Keep me famous, and I might bump your wage to $16.50!",
        sidekickReaction: "Ready"
      }
    ]
  }
];

export const ENDLESS_MODE_CONFIG = {
  id: 'endless',
  title: "Endless Overtime Frenzy",
  subtitle: "Non-stop collateral damage survival shift",
  theme: "downtown",
  minApproval: 20,
  wageRate: 22.00,
  hazardTypes: ['window', 'fire', 'debris', 'wire', 'sign'],
  bgColor: '#2b2d42',
  skyColor: '#4f5d75',
  roadColor: '#202028'
};
