# Backyard Brawl: project overview

A single-file HTML5 16-bit wrestling game starring the real wrestlers of the 209 Dragon's Den, built by Liam McGinn ("The Viral Voice").

## Links
- Live game: https://209-backyard-beatdown.mcginnliam.workers.dev
- Test link (new features first): https://209-backyard-beatdown.mcginnliam.workers.dev/?test=1

## How work flows
- New features go on the test link first. They move to the live game only when Liam says so.
- Bug fixes go to both links.
- Mobile is the top priority; controllers (Xbox / PlayStation) and keyboard also work.
- Online play (1v1 and up to 4 players) needs every phone on the same version. A phone with an older copy updates itself when it joins.

## Art pipeline
- Liam draws all sprite art himself in ChatGPT. Every sheet prompt lives in Backyard_Brawl_Move_Sheets.md.
- Rules for every sheet: 16-bit pixel style, facing RIGHT, the same size as his standing sprite, plain magenta background, whole body and both boots in every frame, frames spaced apart.
- What works: ChatGPT draws clear single poses well. It struggles with two bodies tangled together or a body passing through ropes. For those moves, draw both men (or the ropes) in so the pose is right, then ask it to erase one. Or let the game do the motion between poses.
- Golden sheets: draw one move right with The Viral Voice and C.Diddy, then copy it for everyone else.
- Reference photos (fireman's carry, ring entry) are kept with the art in the repo.

## Sheets
| Sheet | What | Status |
|---|---|---|
| A-P, W | Core moves, weapons, cage, tables, chairs, ladders | Done (ladder Sheet P frames 1 and 5 need redoing) |
| Q | Running, 4 frames | Needed for everyone |
| R | Lifting and slamming, doing the move | 11 wrestlers done (Viral, Dazzle, CJ Dirt, C.Diddy, Big MF, Asesino, Frank, Kruze, Jason, Ghoulie, Firebelly) |
| S | Taking the move | Dazzle, C.Diddy, Big MF; Viral needs frame 4 fixed |
| T | On the mat and in the ropes | Dazzle, CJ Dirt, C.Diddy; Flaco needs frame 2 fixed |
| U | Finishers and signatures, per wrestler | Not started |
| V | Fireman's carry, golden (Viral + C.Diddy) | Frames 1-4 done |
| X | Ring movement: rolls, apron crouch, climbing the turnbuckle, landing, getting up | Viral: 6 of 8 good; turnbuckle frames need redoing with the corner drawn in |
| X2 | Stepping through the ropes | Viral frames 1-3 good; the game does the duck-through |

Recommended order: X for Viral, then finish R and S for everyone, X for everyone, then Q, Y (hit reactions), Z (ropes and corner), then U one wrestler at a time.

## Roster notes
- Tag teams: Team RAD (Razzle & Dazzle), B.L.E. (Tripp Rogers & Jason Hastings), The Lucha Cartel (Necrosis Black, Spektro Black, Ultimo Jaguar), The Damned Devil Doggs (Douglas Frank & Big Moe Dogg; Big Moe is not in the game yet).
- The 209 Kliq Enforcer is dropped. Don't make art or features for him.
- Jason's gear should say BLE (it currently says BZE).
- Titles: BMF World Heavyweight, World Tag Team, Social Media (red strap).

## Maps
- BMF Ranch and the Secret Map (the Den's barn, with C.Diddy at the door), both with the game's own bouncing ropes.
- Wrestlers enter the ring from the right side.

## Waiting on Liam
- Big Moe Dogg photos
- Current champions
- The Delta Kid's details
- Finisher and style info for the newest wrestlers
