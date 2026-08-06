export type Article = {
  title: string
  description: string
  publishedTime: string
  intro: string
  sections: { heading: string; paragraphs: string[] }[]
}

export const articles: Record<string, Article> = {
  'tiruchendur-temple-darshan-timings': {
    title: 'Tiruchendur Temple Darshan Timings: Planning Your Visit',
    description: 'Plan your Tiruchendur Murugan Temple darshan with practical timings, queue advice, festival updates and nearby accommodation tips.',
    publishedTime: '2026-07-26',
    intro: 'Tiruchendur Murugan Temple opens early and welcomes pilgrims throughout the day. A little planning helps you choose the best darshan slot, avoid long waits, and book a stay close to the temple.',
    sections: [
      {
        heading: 'Temple opening hours',
        paragraphs: [
          'The Tiruchendur Murugan Temple is generally open from 5:00 AM until 9:00 PM daily, with a short mid-day break for ritual cleaning. Timings may vary on festival days and special temple occasions, so confirm the schedule with local staff before your visit.',
          'The earliest darshan window is usually the calmest, while the late evening Arthajama pooja is a popular option for visitors arriving after afternoon travel. Always leave extra buffer time for security checks and queue movement.',
        ],
      },
      {
        heading: 'Choosing the best darshan slot',
        paragraphs: [
          'Early morning darshan is ideal if you prefer a quieter experience and want to avoid midday heat. Arriving before sunrise can also be helpful when festival crowds grow later in the day.',
          'If you miss the morning rush, aim for the late evening pooja. Weekdays are generally less busy than weekends, full moon days and public holidays.',
        ],
      },
      {
        heading: 'What to expect during darshan',
        paragraphs: [
          'The temple has separate entry points and waiting areas, so follow the signboards and the instructions of temple volunteers. Maintain a modest dress code and carry only essentials, as many items are restricted inside the sanctum.',
          'Temple rituals and sevas are conducted throughout the day, so plan your arrival around the darshan window you want. If you travel during a festival, expect longer queues and potentially longer wait times near the sanctum.',
        ],
      },
      {
        heading: 'Staying near the temple',
        paragraphs: [
          'Choose a hotel or homestay within easy walking distance of Temple Road or the beachfront to make early morning and evening darshan sessions convenient. Nearby accommodation is especially useful when you want to return quickly between temple visits.',
          'If you are visiting for a special puja or festival, book your stay in advance and let your host know your arrival details so they can arrange a pickup from the station or bus stand.',
        ],
      },
    ],
  },
  'best-time-to-visit-tiruchendur': {
    title: 'Best Time to Visit Tiruchendur: Weather, Festivals and Travel Tips',
    description: 'Discover the best season to visit Tiruchendur, from cooler winter weather to festival timing and what to expect during monsoon months.',
    publishedTime: '2026-07-26',
    intro: 'Tiruchendur is a coastal pilgrimage town with a vibrant temple calendar. The best time to visit depends on whether you want cooler weather, a quieter retreat, or the energy of a major festival.',
    sections: [
      {
        heading: 'Ideal season for weather',
        paragraphs: [
          'November through February is the most pleasant period to visit Tiruchendur. The temperature is milder, humidity is lower, and the evenings are comfortable for a walk on the beach after darshan.',
          'The winter months are also the peak season for pilgrims. Book accommodation early if you want a stay close to the temple during this period.',
        ],
      },
      {
        heading: 'Summer and heat considerations',
        paragraphs: [
          'March to May can be hot and humid, with daytime temperatures often rising above 35°C. If you visit in summer, schedule temple visits for early morning or late evening and keep water, sunscreen, and a hat handy.',
          'Summer can still be a good time for budget travel if you prefer fewer crowds, but choose accommodations with good ventilation or air conditioning.',
        ],
      },
      {
        heading: 'Monsoon and shoulder months',
        paragraphs: [
          'The northeast monsoon usually brings showers from October to December. Rainfall is often brief, but stormy weather can affect road travel. Still, monsoon travel can offer a quieter pilgrimage experience and lush coastal scenery.',
          'If you are comfortable with occasional rain, the shoulder months just before and after the heaviest monsoon season can be a good balance of fewer visitors and manageable weather.',
        ],
      },
      {
        heading: 'Festival timing and crowd choices',
        paragraphs: [
          'Kanda Sashti, Thai Poosam and Panguni Uthiram are among the main festivals celebrated in Tiruchendur. These times bring a devotional atmosphere and special rituals, but also larger crowds and higher demand for nearby stays.',
          'For a quieter visit, avoid the major festival weeks and choose a weekday outside the busiest pilgrimage season. If you want the festival experience, book your room early and plan for longer darshan queues.',
        ],
      },
    ],
  },
  'tiruchendur-kanda-sashti-festival': {
    title: 'Tiruchendur Kanda Sashti Festival 2026: Stay and Travel Guide',
    description: 'Get ready for Tiruchendur’s Kanda Sashti festival with accommodation advice, travel tips and expectations for the crowds and rituals.',
    publishedTime: '2026-07-26',
    intro: 'Kanda Sashti is one of Tiruchendur’s most important Murugan festivals. Pilgrims gather for special poojas, processions and the powerful Soorapadham ritual, making early planning essential.',
    sections: [
      {
        heading: 'Festival significance',
        paragraphs: [
          'Kanda Sashti commemorates Lord Murugan’s victory over the demon Soorapadman and is observed with devotion at Tiruchendur Murugan Temple. The six-day festival includes special offerings, prayer sessions and the recitation of devotional hymns.',
          'The festival falls in the Tamil month of Aippasi, and its exact dates are confirmed by the temple administration each year. Pilgrims from across Tamil Nadu come to Tiruchendur for the rituals and the unique seaside temple atmosphere.',
        ],
      },
      {
        heading: 'What to expect during the festival',
        paragraphs: [
          'During Kanda Sashti, the temple runs a packed schedule of abhishekams, pujas and processions. The highlight is the Soorapadham rite, which dramatizes the warrior god’s victory and draws large crowds of worshippers.',
          'Expect significant crowds around the temple, especially during morning and evening rituals. Local vendors and helpers are usually available, but it is wise to plan your movements around the temple schedule and stay close by.',
        ],
      },
      {
        heading: 'Accommodation and travel tips',
        paragraphs: [
          'Book your stay as soon as you know the festival dates. Rooms near Temple Road and the beachfront are in high demand during Kanda Sashti, so early reservations are the safest option.',
          'If you arrive by train or bus, let your host know your arrival time. Many accommodations offer pickups from Tiruchendur station or bus stand, which can simplify the final leg of the journey during busy festival days.',
        ],
      },
      {
        heading: 'Practical festival advice',
        paragraphs: [
          'Carry water, light snacks, a small towel and a fully charged mobile phone. Festival days can be long, and having a nearby place to rest between temple visits makes the experience more comfortable.',
          'For family travel, choose a stay with easy access to the temple so children and elderly relatives can take breaks when needed. A short walk from the temple is often the most convenient choice during the festival.',
        ],
      },
    ],
  },
  'how-to-reach-tiruchendur': {
    title: 'How to Reach Tiruchendur: Train, Bus and Flight Travel Guide',
    description: 'A practical travel guide for reaching Tiruchendur by air, rail, road and local transport, with advice for festival and off-season arrivals.',
    publishedTime: '2026-07-26',
    intro: 'Tiruchendur is reachable by train, bus and nearby airports. Plan the final leg of your journey in advance, especially if you are arriving during a festival or late at night.',
    sections: [
      {
        heading: 'Nearest airports',
        paragraphs: [
          'The nearest airport to Tiruchendur is Tuticorin (Thoothukudi), around 70 kilometers away. From Tuticorin, taxis and buses connect to Tiruchendur in roughly 1.5 to 2 hours.',
          'Madurai Airport is a larger hub about 170 kilometers away and offers more flight choices. From Madurai, you can take a train or bus to Tiruchendur, or hire a private taxi for a comfortable road journey.',
        ],
      },
      {
        heading: 'By train',
        paragraphs: [
          'Tiruchendur has its own railway station on the Tirunelveli–Tiruchendur line. Direct trains arrive from Tirunelveli, Chennai and other South Indian cities, making rail a convenient option for many pilgrims.',
          'If direct services are limited, travel to Tirunelveli or Madurai and continue by bus or taxi. From the Tiruchendur station, most stays are a short auto-rickshaw ride away.',
        ],
      },
      {
        heading: 'By road and bus',
        paragraphs: [
          'Regular buses operate between Tiruchendur and destinations such as Tirunelveli, Tuticorin, Madurai and Nagercoil. State-run and private services offer a range of comfort levels, from ordinary buses to deluxe coaches.',
          'If you prefer a direct road journey, a private car from a nearby city is convenient. Confirm your hotel’s location before you travel so you can arrange the most direct drop-off point.',
        ],
      },
      {
        heading: 'Local transport in Tiruchendur',
        paragraphs: [
          'Auto-rickshaws and shared cabs are the easiest way to move around town. Many accommodations also provide station or bus stand pickups on request, which is handy when you arrive after a long journey.',
          'If you choose a stay near the temple, most temple visits and beach walks are within easy walking distance. This can save time and make your pilgrimage more relaxed, especially during busy festival periods.',
        ],
      },
    ],
  },
}
