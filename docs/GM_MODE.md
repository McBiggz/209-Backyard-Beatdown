# General Manager Mode + Flyer Run (planned, Nov 9 2026)

On the roadmap under Round 3 (The Main Event). Not started.

## GM Mode
You're the GM of the 209 Dragon's Den (BMF Entertainment, presented by Filthy Farms). Book a weekly show, run it, handle the fallout.

Setup options: season length (10 or 20 weeks), full roster or draft, pick or random champions, budget as difficulty, optional CPU rival promotion.

Weekly loop:
1. Book the card: 3-5 matches/segments (singles, Triple Threat, Fatal 4-Way, tag, title matches, promos, run-ins).
2. For each match: play it, watch CPU vs CPU, or sim instantly (real engine, headless).
3. Results: star rating per match (crowd heat, who's in it, match quality), show score, attendance, money, followers.

Manage: popularity/momentum, face/heel, morale, fatigue + injuries, feuds (Universe rivalry system; hardcore/cage only as blow-offs - Liam's rule),
the three belts (BMF World Heavyweight, World Tag Team, Social Media) with title history, money (tickets, merch, Filthy Farms sponsor vs pay + upgrades),
show upgrades (barn ring, fog machine, entrance lights, secret Barn show), signings (Coming Soon roster), trainees from Hayashi/CJ training.
Big event every few weeks ("Backyard Brawl"): blow-offs and title matches, double ratings/money.

First version: 10-week season, weekly card, play/watch/sim, star ratings, popularity + feuds, three belts, simple money.
Later: morale, injuries, upgrades, signings, rival promotion.

Open questions for Liam: wrestle as yourself inside GM mode or booking only? Rival promotion yes/no? How much should money matter?

## Flyer Run (promo mini-game inside GM mode)
Before a big show, pick a wrestler and go around town posting flyers (bulletin boards, poles, bathroom walls, jukebox).
Posting = hold a button ~2 s at a spot; getting hit interrupts it. Beat-'em-up fights with townies: drunk regulars, a tougher bouncer,
a guy who thinks he can wrestle, a rival crew tearing your flyers down. Timer.
Locations: the bar first; later gas station/liquor store lot, swap meet, college campus (made-up places unless real owners are cool with it).
Payoff: more flyers = bigger crowd/money/followers at the next show; perfect run = hot crowd or popularity boost; getting beat up = fewer flyers
and maybe a banged-up wrestler. Sending a big name draws more but risks your top guy.
Build: reuses the group engine (8 fighters) and wide scrolling stage. Needs: a background per location, enemies (recolor existing wrestler
sprites first, later 2-3 ChatGPT enemy sheets), a flyer prop (real Den flyer if Liam has one).

## Money (Liam: "money should matter a little bit")
In: tickets + merch, small weekly Filthy Farms sponsor payment; good shows earn more. Out: low flat wrestler pay.
No game over: go broke -> sponsor bails you out with a warning and a popularity hit. Money mostly decides how fast you unlock things.

What it buys:
- Show production: fog machine (entrance smoke becomes a purchase), stage lights, powder cannon, sound system (louder crowd), ring announcer.
- Venue: more chairs (bigger crowds/tickets), run a secret show in the Barn, new barn ring, lighting rigs/banners (+show score).
- Roster: sign Coming Soon wrestlers (Tripp, Jason, Ultimo Jaguar...), one-night guest, training sessions with Hayashi/CJ (+stats), medical (faster injury return).
- Promotion: flyer stacks for Flyer Run, social media ads (+followers before an event), print merch (small income every show after).
- Titles/extras: create a new championship (e.g. Hardcore title), unlock alternate gear for the season.

## Sponsorships (Liam picked these three)
1. Offers with a catch: local businesses approach once popularity is high enough. Big payout + a condition
   (e.g. book a Hardcore match this month, a top-rope dive in the main event, champion keeps the belt through the big event,
   reach a follower count by a week). Meet it = bonus; miss it = they drop you and the next sponsor hears about it.
2. Ad spots you can see: sell turnbuckle pads, apron, center of the mat, ref shirt, entrance banners, commentary table.
   The sponsor's logo shows up in the game. More visible spots pay more; raise prices as the Den grows.
5. Sponsor ladder: start small (Filthy Farms, a taco truck, the corner store); bigger names unlock as ratings grow (gym, car dealership,
   energy drink). Some can't be signed together (two rival gyms) - you choose.
Businesses are made up, except Filthy Farms and any real sponsor who says it's okay.
Not picked (maybe later): commentator ad reads / sponsor-named matches, pitch meetings, personal wrestler deals, sponsor flyers in Flyer Run.

---
## Expanded plan (2026-11-14, from Liam)

### Special screens
Each GM screen = ChatGPT background art + game-drawn UI (names, money, ratings, buttons) + small looping animations.
- Backgrounds needed (~5-6): Den back office, booking board on the barn wall, equipment shop, show-night results, medical/trainer room, flyer-run map.
- Code animations: smoke drift, light beams, flicker (like the entrance fog). Sprite moments: wrestler walking in with a request.

### Flyer Run = side-scrolling beat 'em up
- Uses the wide scrolling map with depth (like the ranch), Streets of Rage style.
- Walk a strip of bars/streets; hold a button at poles and bar doors to post a flyer (a few seconds, open to attack).
- Enemy waves: drunks, bouncers, rival promotion guys. Car / props to slam people into.
- Reward: more flyers = bigger crowd at the next show.
- Art: 2-3 wide street backgrounds, 3-4 enemy types (~3 sheets each), 2-frame flyer-posting animation, props.

### Production upgrades (cost per show)
- Smoke machines, light rigs, pyro, bigger sound system, LED entrance wall.
- Raise crowd heat and ratings; show up visibly during that show's entrances and matches.
- Match type costs: standard = cheap; hardcore = chairs/tables/ladders (broken tables must be replaced); cage = rental, most expensive. Bigger matches = bigger ratings.

### Injuries
- Risk up with hardcore/cage, top-rope moves, overworked wrestlers.
- Minor (plays hurt, lower stats) / moderate (out 1-3 weeks) / major (out a month+, may vacate a title).
- Spending on medical speeds recovery. Booking an injured guy = ratings bump but risk of making it worse.

### Favors & morale
- Between shows wrestlers bring requests: title shot, time off, team with a friend, complaints about a partner, pay raise or walk.
- Choices change: individual morale (performance: slightly stronger/weaker, more/fewer mistakes), locker-room morale (favoritism annoys others), relationships (feuds/friendships -> storylines).
- Very low morale: no-shows or quitting.

### Build order
1. Core weekly loop: book card -> buy production -> run show (play or simulate) -> money & ratings. (Test link, placeholder screens.)
2. Injuries, favors and morale.
3. Flyer Run beat 'em up.
4. Polish: final screen art and animations.
Reuse Universe Mode's seasons, titles, rivalries and career record.
