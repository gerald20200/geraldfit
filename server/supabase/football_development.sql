alter table public.profiles
  add column if not exists training_position text,
  add column if not exists training_level text,
  add column if not exists improvement_goals text[] not null default '{}';

update public.profiles
set training_position = case preferred_position
  when 'Winger' then 'LW'
  when 'Striker' then 'ST'
  when 'Defender' then 'CB'
  else 'CM'
end
where training_position is null;

update public.profiles
set training_level = coalesce(nullif(fitness_level, ''), 'Beginner')
where training_level is null;

alter table public.profiles alter column training_position set default 'CM';
alter table public.profiles alter column training_position set not null;
alter table public.profiles alter column training_level set default 'Beginner';
alter table public.profiles alter column training_level set not null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_training_position_check') then
    alter table public.profiles add constraint profiles_training_position_check
      check (training_position in ('GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_training_level_check') then
    alter table public.profiles add constraint profiles_training_level_check
      check (training_level in ('Beginner','Intermediate','Advanced'));
  end if;
end $$;

alter table public.workouts
  add column if not exists teaches text not null default '',
  add column if not exists step_by_step text[] not null default '{}',
  add column if not exists body_position text not null default '',
  add column if not exists common_mistakes text[] not null default '{}',
  add column if not exists coach_tip text not null default '',
  add column if not exists age_adaptation text not null default '',
  add column if not exists skill_tags text[] not null default '{}',
  add column if not exists diagram_type text not null default 'movement';

update public.workouts
set teaches = coalesce(nullif(teaches, ''), description),
    step_by_step = case
      when cardinality(step_by_step) > 0 then step_by_step
      when category = 'Passing' then array['Scan the target before the ball arrives.','Set the non-kicking foot beside the ball and open your hips.','Strike through the centre of the ball toward the target.','Recover to a balanced starting position.']
      when category = 'Dribbling' then array['Approach under control with short touches.','Keep the ball within one step and lift your eyes between touches.','Use the indicated turn or feint at the marker.','Accelerate into the open space and reset.']
      when category = 'Agility' then array['Start balanced with knees softly bent.','Move on the cue using short, controlled steps.','Keep your chest over your base and decelerate before turning.','Reset fully before the next quality repetition.']
      else array['Warm up gradually and mark a clear lane.','Build effort smoothly; keep the movement technically clean.','Recover by walking and breathing steadily.','Stop if pain, dizziness, or unusual discomfort occurs.']
    end,
    body_position = case
      when category = 'Passing' then 'Stand side-on to the target, plant foot beside the ball, toe pointing toward the pass, ankle firm, and chest balanced over the strike.'
      when category = 'Dribbling' then 'Stay light on the feet with soft knees, a slight forward lean, and the ball close enough to protect with your body.'
      when category = 'Agility' then 'Keep hips low, knees tracking over toes, chest balanced, and head up; decelerate before changing direction.'
      else 'Keep a tall, relaxed posture, drive from the hips, land softly, and maintain control rather than chasing fatigue.'
    end,
    common_mistakes = case
      when category = 'Passing' then array['Locking the ankle late or leaning away from the target.','Passing before scanning or allowing the first touch to drift into pressure.']
      when category = 'Dribbling' then array['Taking touches too far ahead or staring down at the ball.','Turning without selling the feint or accelerating after the move.']
      when category = 'Agility' then array['Crossing the feet while shuffling or standing upright.','Turning at full speed without braking or landing with the knee collapsing inward.']
      else array['Starting at maximum effort before warming up.','Skipping recovery or continuing when technique becomes unsafe.']
    end,
    coach_tip = case
      when category = 'Passing' then 'Make the picture early: scan, shape your body, then choose the pass. Accuracy and repeatable contact come before power.'
      when category = 'Dribbling' then 'Change speed after the action, not during the setup. Practise both feet and keep your next option in view.'
      when category = 'Agility' then 'Quality of braking and body shape matters more than cone speed. Add pace only after every turn is controlled.'
      else 'Use progressive loading: build consistency first, then add a small amount of work while preserving clean movement and full recovery.'
    end,
    age_adaptation = case
      when 'GK' = any(positions) and (title ilike '%dive%' or title ilike '%save%' or title ilike '%goal-line%') then 'Under 13: use a soft surface and low, short rolls with an adult coach; do not practise full-height dives alone. Ages 13–16: keep dives low and supervised. Ages 17+: progress distance only when landing technique is sound.'
      when title ilike '%head%' or title ilike '%aerial%' then 'Under 13: use a soft ball and practise timing without contact. Ages 13–16: use light, low-volume technique work with supervision. Ages 17+: increase only with safe technique; never train through head or neck pain.'
      else 'Under 13: use about half the listed volume with generous rest and adult supervision for sprinting. Ages 13–16: use roughly three-quarters of the volume and prioritise technique. Ages 17+: use the full prescription only while movement remains clean.'
    end,
    skill_tags = case category
      when 'Passing' then array['Passing','First touch','Awareness']
      when 'Dribbling' then array['Ball control','Dribbling','Ball retention']
      when 'Agility' then array['Movement','Coordination','Decision-making']
      else array['Speed','Stamina','Conditioning']
    end,
    diagram_type = case
      when title ilike '%switch%' then 'switching'
      when title ilike '%through-ball%' then 'through_ball'
      when title ilike '%wall receive%' or title ilike '%half-turn%' then 'wall_receive'
      when title ilike '%cut-in%' then 'cut_in'
      when title ilike '%distribution%' then 'distribution'
      when 'GK' = any(positions) and (title ilike '%position%' or title ilike '%set,%') then 'keeper_set'
      when 'GK' = any(positions) then 'goalkeeping'
      when title ilike '%aerial%' or title ilike '%head%' then 'aerial'
      when title ilike '%intercept%' then 'interception'
      when title ilike '%jockey%' or title ilike '%mark%' or title ilike '%block%' or title ilike '%defen%' or title ilike '%pressing%' or title ilike '%back-line%' then 'defending'
      when title ilike '%finish%' or title ilike '%shoot%' or title ilike '%composure%' then 'shooting'
      when category = 'Dribbling' or title ilike '%dribbl%' or title ilike '%turn%' or title ilike '%touch%' or title ilike '%escape%' then 'dribbling'
      when category = 'Passing' or title ilike '%pass%' then 'passing'
      when title ilike '%movement%' or title ilike '%run%' then 'movement'
      else 'conditioning'
    end
where cardinality(positions) > 0
  and id::text like 'a1f10001-%';

insert into public.workouts
  (id,title,category,duration_minutes,difficulty,description,instructions,image_url,equipment_needed,positions,recommended_repetitions,teaches,step_by_step,body_position,common_mistakes,coach_tip,age_adaptation,skill_tags,diagram_type)
values
('a1f10002-0001-4a02-8a02-000000000001','Laces Strike Mechanics','Agility',14,'Beginner','Learn clean contact and a stable follow-through for driven shots.','Place the ball still and strike through its centre with the laces. Begin at a short distance, aim through a wide target gate, and increase distance only after consistent contact.','',array['Football','2 cones'],array['ST','CF','LW','RW'],'4 sets x 5 strikes per foot','Develops repeatable laces contact, shot balance, and accuracy before power.',array['Approach with a slight angle.','Plant your non-kicking foot beside the ball, pointing at the target.','Lock the striking ankle and contact the middle of the ball with the laces.','Let the kicking leg follow through toward the target and land balanced.'],'Eyes on the ball at contact; chest slightly over it; plant foot close and alongside; ankle firm.',array['Leaning back and lifting every shot.','Planting too far from the ball or striking with a loose ankle.'],'Coach the contact point first. A quiet, balanced finish is more repeatable than a maximal swing.','Under 13: 2 sets x 4 from close range with a soft ball. Ages 13–16: use 3 sets and full rest. Ages 17+: use the full prescription if contact stays clean.',array['Shooting','Finishing','Technique'],'shooting'),
('a1f10002-0001-4a02-8a02-000000000002','Weak-Foot Target Ladder','Passing',15,'Intermediate','Build confidence receiving and finishing with the less-used foot.','Use a wall or target gate. Complete a first-touch setup with your weaker foot, then pass or finish through the gate. Move one step farther away after a clean set; move closer if accuracy drops.','',array['Football','4 cones','Wall optional'],array['ST','CF','LW','RW'],'4 rounds x 6 actions; 3 passes and 3 finishes per round','Improves weak-foot first touch, passing accuracy, and finishing confidence.',array['Set a close, medium, and far target.','Receive or settle the ball only with your weaker foot.','Open the hip enough to guide an inside-foot pass or lock the ankle for a strike.','Record accurate actions at each distance and reset the ball.'],'Plant foot stable beside the ball, shoulders relaxed, hips facing the chosen target, and ankle firm through contact.',array['Switching feet when the weaker-foot setup feels awkward.','Increasing distance before accuracy is consistent.'],'Use the weaker foot in low-pressure repetitions until the movement feels familiar, then introduce a decision cue.','Under 13: use the close target and 2 rounds. Ages 13–16: use 3 rounds. Ages 17+: complete the full ladder without rushing.',array['Weak foot','First touch','Passing','Finishing'],'passing'),
('a1f10002-0001-4a02-8a02-000000000003','Winger Cut-In Finish','Agility',16,'Intermediate','Practise changing line from the wing and finishing after a controlled cut-in.','Start wide with the ball. Carry diagonally toward a central marker, take a touch across your body, then finish at a far-side target. Alternate the starting wing and finishing foot.','',array['Football','4 cones','Goal or target'],array['LW','RW'],'4 sets x 4 attacks from each side','Develops winger ball carrying, cut-in timing, and far-corner finishing.',array['Begin wide and lift your eyes before the central marker.','Use one change-of-direction action to move inside.','Touch the ball out of your feet without losing protection.','Set your plant foot and finish toward the far target.'],'Lean into the cut, keep the ball just outside the stride, then get chest over the ball at the strike.',array['Cutting too early and running into the marker.','Taking the final touch too close to the body for a clean strike.'],'Sell the wide run before cutting inside; the change of line is more effective after the defender shifts.','Under 13: shorten the approach and use 2 sets. Ages 13–16: use 3 sets. Ages 17+: use the full prescription and alternate both feet.',array['Dribbling','Shooting','Decision-making','Weak foot'],'shooting'),
('a1f10002-0001-4a02-8a02-000000000004','Channel Run and Check Shoulder','Agility',12,'Beginner','Time a forward run into space and arrive ready for the next action.','Set a start cone and a channel gate. Check over your shoulder before moving, curve away from the start, then accelerate through the gate to receive a rolled pass. Reset at walking pace.','',array['Football','3 cones'],array['ST','CF'],'4 sets x 5 timed runs each side','Develops blindside movement, scan timing, and arrival into a passing lane.',array['Start next to a marker as if positioned against a defender.','Check your shoulder before the run.','Move away briefly, then curve into the channel.','Accelerate through the gate and prepare the body to receive.'],'Stay on the toes, look across both shoulders before the run, and arrive half-turned rather than square.',array['Running in a straight line from the start.','Looking only once or checking after the pass is already played.'],'The best run creates a new passing angle; change pace after the check to separate from the marker.','Under 13: use a 5-metre channel and 3 runs per set. Ages 13–16: use 3 sets. Ages 17+: use the full distance and prescription.',array['Attacking movement','Awareness','First touch'],'movement'),

('a1f10002-0001-4a02-8a02-000000000005','Diagonal Switch Gate','Passing',15,'Intermediate','Switch play accurately to move the ball away from pressure.','Set two gates 8–12 metres apart on a diagonal. Receive from a wall or partner, scan across the field, then play through the far gate with a driven pass. Alternate both feet and distances.','',array['Football','4 cones','Wall optional'],array['CM','CDM','CAM','LM','RM'],'5 sets x 6 switches; 3 each foot','Develops long passing, scanning, and switching the point of attack.',array['Before receiving, scan toward the far-side target.','Open your hips toward the diagonal.','Plant beside the ball and strike through its centre with a firm ankle.','Follow the pass and reset to receive on the other side.'],'Stand side-on, non-kicking foot points along the diagonal, head steady through contact, and finish balanced.',array['Trying to lift the ball with the toe.','Looking at the target only after the first touch.'],'The scan should happen before the ball arrives so your first touch and hips already support the switch.','Under 13: shorten the distance and use a rolled pass. Ages 13–16: use 3 sets. Ages 17+: use full distance with both feet.',array['Long passing','Vision','Switching play'],'passing'),
('a1f10002-0001-4a02-8a02-000000000006','Scan-Call-Play Triangle','Passing',12,'Beginner','Build a habit of scanning and communicating before the pass.','Set three cone gates in a triangle. Before each wall rebound or partner pass, call the next gate aloud, receive with an open body, and pass through the called target. Change the order each round.','',array['Football','6 cones','Wall or partner'],array['CM','CDM','CAM','LM','RM'],'4 rounds x 8 passes; 30 seconds rest','Develops vision, verbal communication, passing accuracy, and first-touch planning.',array['Set three clear gates at different angles.','Check both shoulders while the ball travels.','Call the target before the first touch.','Receive across the body and pass through the named gate.'],'Use a half-turned stance, keep the head moving before reception, and point the support foot at the pass.',array['Calling late after controlling the ball.','Receiving square and needing extra touches to find the target.'],'Scanning is useful only when it changes the next action; call a realistic target and play quickly with control.','Under 13: use two nearby gates and 2 rounds. Ages 13–16: use 3 rounds. Ages 17+: vary the target order.',array['Vision','Awareness','Passing accuracy','Communication'],'passing'),
('a1f10002-0001-4a02-8a02-000000000007','Driven Long-Pass Ladder','Passing',15,'Advanced','Develop consistent driven passing over increasing distances.','Create three target gates at progressive distances. From a stationary ball, use a measured approach and strike through the middle-to-lower half of the ball. Progress only after two accurate passes at the current distance.','',array['Football','6 cones'],array['CM','CDM','CAM','LM','RM'],'4 rounds x 3 attempts at each distance per foot','Develops long-pass range, contact quality, and repeatable technique.',array['Mark short, medium, and long target gates.','Take a measured approach with eyes switching between target and ball.','Plant foot beside the ball, ankle firm, and strike through the intended line.','Hold a balanced follow-through and record accuracy before moving back.'],'Approach at a slight angle, hips open to target, chest stable, and striking leg follows through across the line.',array['Leaning back to force height.','Trying to reach the longest gate before mastering the shorter one.'],'Distance comes from clean contact and timing, not a bigger backswing; finish balanced and let the ball travel.','Under 13: keep all passes under 10 metres. Ages 13–16: use 3 sets and full recovery. Ages 17+: progress distance only with clean contact.',array['Long passing','Passing accuracy','Technique'],'passing'),
('a1f10002-0001-4a02-8a02-000000000008','Double-Pivot Screen and Recover','Stamina',14,'Intermediate','Protect the centre lane, adjust with the ball, and recover into a passing option.','Set a central screen cone and two side gates. Shuffle across the screen line as the ball moves, keep the central gate protected, then recover to the nearest side gate to receive a pass. Alternate directions.','',array['4 cones','Football'],array['CDM'],'4 sets x 5 screen-and-recover patterns each side','Develops defensive awareness, pivot spacing, and support movement after a recovery.',array['Begin between the ball and the central target.','Shuffle laterally while keeping the central lane screened.','Open the hips when the ball moves beyond your side.','Recover diagonally into a visible passing lane.'],'Stay half-turned, keep a view of both ball and central space, and use short steps to protect the lane.',array['Following the ball and opening the central pass.','Recovering straight toward the ball instead of creating a passing angle.'],'A defensive midfielder protects the most dangerous space first, then becomes a forward-facing outlet after the regain.','Under 13: walk the pattern and use 2 sets. Ages 13–16: use 3 sets. Ages 17+: add a visual pass cue.',array['Defensive awareness','Positioning','Ball retention'],'defending'),
('a1f10002-0001-4a02-8a02-000000000009','Press Escape and Retain','Dribbling',13,'Intermediate','Use a first touch and turn to keep possession under simulated pressure.','Place a pressure cone behind the receiving point and two exit gates ahead. Receive from a wall, check the pressure side, turn away with an inside or outside touch, and pass through the open gate.','',array['Football','4 cones','Wall'],array['CM','CDM','CAM','LM','RM'],'4 sets x 6 escapes; alternate turn direction','Develops ball retention, turning under pressure, and passing after an escape.',array['Scan before the wall pass returns.','Receive on the back foot with the body between ball and pressure cone.','Use a sharp turn away from pressure.','Pass through the open exit gate and reset.'],'Lower the centre of gravity, keep the arm naturally out for balance, and place the body between defender and ball.',array['Taking the first touch toward the pressure cone.','Turning without checking which gate is free.'],'The first touch should solve the pressure before the turn; keep the ball protected and eyes up on exit.','Under 13: remove one exit gate and slow the movement. Ages 13–16: use 3 sets. Ages 17+: add a called exit gate.',array['Ball retention','First touch','Turning','Awareness'],'dribbling'),

('a1f10002-0001-4a02-8a02-000000000010','Contain, Match, Tackle','Agility',14,'Intermediate','Delay an attacker, stay balanced, then win the ball at the right moment.','Set a narrow channel and roll the ball ahead as the attacker. Shuffle backward to contain the space, match the change of direction, then step across the ball only when it moves out of the attacker’s control.','',array['Football','4 cones','Partner optional'],array['CB','LB','RB'],'4 sets x 5 contain-and-win repetitions each side','Develops one-on-one defending, tackle timing, and controlled deceleration.',array['Start goal-side and approach under control.','Drop into a side-on stance and guide the attacker away from the centre.','Match the attacker with short lateral steps.','Step in only when the ball is exposed, then secure and reset.'],'Hips low, knees bent, weight on the balls of the feet, and lead foot angled to show the attacker wide.',array['Diving into a tackle from too far away.','Crossing the feet or standing square while retreating.'],'Defend the space first. A patient delay can be more valuable than a rushed tackle.','Under 13: practise shadowing only, no contact. Ages 13–16: use a partner at walking speed with supervision. Ages 17+: keep the tackle controlled and non-contact in solo practice.',array['One-on-one defending','Tackling','Balance'],'defending'),
('a1f10002-0001-4a02-8a02-000000000011','Jockey Channel Mirror','Agility',12,'Beginner','Keep an attacker in front and guide movement toward a safe channel.','Set a 4-metre lane. Move laterally between two cones in a low stance, keeping your chest facing the attacker marker. Pause and reset whenever your feet cross or your balance shifts.','',array['4 cones'],array['CB','LB','RB'],'4 sets x 20 seconds; rest 40 seconds','Develops marking footwork, defensive positioning, and lateral balance.',array['Mark a narrow channel with two side cones.','Start side-on with a goal-side position.','Shuffle to mirror the attacker marker without crossing feet.','Pause in balance and reset from the centre.'],'Hips down, chest forward, feet shoulder-width, and weight evenly distributed so either foot can move.',array['Crossing feet and losing the ability to turn.','Standing upright or reaching with the upper body instead of moving the feet.'],'Stay between attacker and goal; guide the route and keep enough distance to react.','Under 13: use a wide lane and 10-second sets. Ages 13–16: use 15 seconds. Ages 17+: use the full time without sacrificing posture.',array['Marking','Defensive positioning','Agility'],'defending'),
('a1f10002-0001-4a02-8a02-000000000012','Aerial Timing and Safe Landing','Stamina',12,'Intermediate','Time a jump and land safely while contesting a high ball.','Toss a soft ball to a marked spot. Start side-on, track the ball, jump vertically from one or two feet, reach at the highest safe point, then land on both feet with knees soft. Do not add contact in solo work.','',array['Soft football','2 markers'],array['CB','LB','RB'],'3 sets x 5 jumps; rest 45 seconds','Develops aerial timing, balance, and safe landing mechanics.',array['Track the flight early and adjust with small steps.','Load hips and knees before take-off.','Jump upward with eyes on the ball and arms balanced.','Land quietly on both feet and regain stance before the next rep.'],'Keep head neutral, trunk braced, knees aligned over toes, and landing soft with hips back.',array['Jumping before judging the ball path.','Landing stiff-legged or letting knees collapse inward.'],'Win the timing before adding height or contact; practise clean take-off and landing first.','Under 13: no heading or contact; use a soft ball and practise catching. Ages 13–16: low-volume jumps with supervision. Ages 17+: add height only after stable landings.',array['Aerial ability','Balance','Timing'],'defending'),
('a1f10002-0001-4a02-8a02-000000000013','Back-Line Call and Shift','Agility',10,'Beginner','Practise clear defensive communication and coordinated line movement.','Set three cones as a back line and one cone as the ball. Move the line together toward the ball, call “step” on a forward cue and “drop” on a retreat cue, then reset spacing between players or markers.','',array['4 cones','Partner optional'],array['CB','LB','RB'],'4 sets x 6 step/drop calls','Develops defensive communication, line spacing, and shared movement cues.',array['Set markers with even spacing across the line.','Scan the ball and the space behind.','Call the agreed cue loudly before moving.','Shift together, then restore the line and spacing.'],'Stay half-turned to see ball and space, move with short coordinated steps, and keep shoulders level.',array['Moving before communicating the cue.','Leaving a large gap between line markers.'],'Use short, consistent words and call early enough for teammates to react together.','Under 13: practise with walking movement and a coach/parent calling cues. Ages 13–16: add a jog. Ages 17+: vary the cue timing.',array['Communication','Defensive positioning','Awareness'],'defending'),

('a1f10002-0001-4a02-8a02-000000000014','One-on-One Angle Narrowing','Agility',14,'Intermediate','Close the angle, stay patient, and set your body before a close-range save.','Start on the goal line. Move forward on a controlled approach as the attacker marker advances, then set feet shoulder-width when the marker reaches the shooting line. Track the ball and make a balanced low save movement.','',array['Football','3 markers','Goal or marked gate'],array['GK'],'4 sets x 4 angle-close repetitions each side','Develops one-on-one positioning, set timing, and controlled save movement.',array['Start centred on the goal line.','Advance in small balanced steps as the attacker approaches.','Set when the attacker is close enough to shoot.','Track the ball and push into a low save line; recover to centre.'],'Hands forward and relaxed, knees flexed, chest over feet, and weight ready to move in either direction.',array['Charging too early and giving a simple finish.','Setting with straight legs or hands behind the body.'],'Make the goal look smaller by controlling distance and balance; do not commit before the attacker’s touch.','Under 13: use a soft ball at walking speed and no full dives. Ages 13–16: low controlled saves with adult supervision. Ages 17+: progress only on a safe surface.',array['One-on-one saves','Positioning','Shot stopping'],'goalkeeping'),
('a1f10002-0001-4a02-8a02-000000000015','High-Ball Claim and Protect','Agility',12,'Intermediate','Move through the ball’s path, claim it at the highest safe point, and land balanced.','Toss a soft ball above and slightly ahead. Call “keeper”, take a balanced step through the drop zone, catch with hands forming a W, bring the ball into the chest, and land with feet under the hips.','',array['Soft football','Open soft area'],array['GK'],'3 sets x 6 claims from each side','Develops aerial handling, communication, and secure landing position.',array['Call early and move onto the flight line.','Take off from a balanced base with knee lifted for protection in coached practice.','Reach with both hands and catch in front of the forehead.','Bring the ball to the chest and land balanced.'],'Eyes on the ball, elbows softly bent, hands behind the ball, and body aligned under the landing point.',array['Catching with arms behind the head.','Landing off balance or practising contact without supervision.'],'Prioritise a clean two-hand catch and safe landing before adding traffic or pressure.','Under 13: self-toss a soft ball at low height. Ages 13–16: practise with supervision. Ages 17+: add movement only on clear ground.',array['Aerial handling','Catching','Communication'],'goalkeeping'),
('a1f10002-0001-4a02-8a02-000000000016','Keeper Four-Corner Footwork','Agility',10,'Beginner','Use small adjustment steps to get set behind shots from different angles.','Mark four corners around a central starting cone. Move from centre to each corner with short steps, finish in a ready set position, then recover to centre before the next direction.','',array['5 cones'],array['GK'],'4 rounds x 3 visits to each corner','Develops goalkeeper footwork, balance, and repeatable set position.',array['Start balanced in the centre.','Move with short adjustment steps toward a called corner.','Arrive behind the target line and set the feet.','Recover through centre before moving to another corner.'],'Feet shoulder-width, knees softly bent, hands forward, and head steady while moving.',array['Taking large crossover steps too early.','Arriving with feet together or hands low.'],'Small adjustment steps keep the body ready; finish every movement in a visible set position.','Under 13: walk the pattern for 2 rounds. Ages 13–16: use 3 rounds. Ages 17+: respond to a random cue.',array['Footwork','Positioning','Balance'],'goalkeeping'),
('a1f10002-0001-4a02-8a02-000000000017','Distribution Accuracy Gates','Passing',14,'Intermediate','Combine secure handling with accurate short and long distribution.','Set a short rolling gate and a longer target gate. Collect the ball, set your feet, then roll through the short gate or use a controlled pass through the far gate. Alternate target based on a spoken cue.','',array['Football','6 cones'],array['GK'],'4 sets x 5 rolls and 5 passes to each target','Develops goalkeeper distribution, passing accuracy, and decision-making.',array['Secure the ball and scan both target gates.','Choose the target from the cue.','Set the plant foot and use a relaxed arm roll or firm inside-foot pass.','Follow the distribution and reset in a ready stance.'],'Stay balanced over the base, point the support foot to the target, and finish with the hand/foot toward the intended line.',array['Releasing before identifying the target.','Overthrowing the short option or forcing a difficult long pass.'],'The fastest pass is not always the best pass; choose the safe, useful option the picture gives you.','Under 13: use the short roll only. Ages 13–16: add the nearer pass gate. Ages 17+: vary the target cue.',array['Distribution','Passing accuracy','Decision-making'],'passing')
on conflict (id) do update set
  title=excluded.title, category=excluded.category, duration_minutes=excluded.duration_minutes,
  difficulty=excluded.difficulty, description=excluded.description, instructions=excluded.instructions,
  image_url=excluded.image_url, equipment_needed=excluded.equipment_needed, positions=excluded.positions,
  recommended_repetitions=excluded.recommended_repetitions, teaches=excluded.teaches,
  step_by_step=excluded.step_by_step, body_position=excluded.body_position,
  common_mistakes=excluded.common_mistakes, coach_tip=excluded.coach_tip,
  age_adaptation=excluded.age_adaptation, skill_tags=excluded.skill_tags, diagram_type=excluded.diagram_type;

update public.workouts as workout
set diagram_type = lesson.diagram_type
from (values
  ('First-Touch Gate','wall_receive'),
  ('Three-Zone Finishing','shooting'),
  ('Change-Pace 1v1','dribbling'),
  ('Blindside Movement Pattern','movement'),
  ('One-on-One Composure','shooting'),
  ('First-Five Acceleration','conditioning'),
  ('Passing Range Ladder','passing'),
  ('Through-Ball Window','through_ball'),
  ('Pressure-Box Receiving','wall_receive'),
  ('Shield and Escape','dribbling'),
  ('Half-Turn Wall Receive','wall_receive'),
  ('Four-Way Turn Matrix','dribbling'),
  ('Pressing Trigger Shadow','defending'),
  ('Front-Foot Interception','interception'),
  ('Back-Line Shuffle and Drop','defending'),
  ('Mirror Marking Footwork','defending'),
  ('Block the Angle','defending'),
  ('Jump and Head Clear','aerial'),
  ('Split-Pass Build-Out','passing'),
  ('Recovery Run and Turn','conditioning'),
  ('Set, Move, Save','keeper_set'),
  ('Low-Dive Technique','goalkeeping'),
  ('Catch, Set, Reset','goalkeeper_catch'),
  ('Goal-Line Positioning Arc','keeper_set'),
  ('Reaction Ball Wall','keeper_reaction'),
  ('Roll and Pass Distribution','distribution'),
  ('Laces Strike Mechanics','shooting'),
  ('Weak-Foot Target Ladder','passing'),
  ('Winger Cut-In Finish','cut_in'),
  ('Channel Run and Check Shoulder','movement'),
  ('Diagonal Switch Gate','switching'),
  ('Scan-Call-Play Triangle','passing'),
  ('Driven Long-Pass Ladder','passing'),
  ('Double-Pivot Screen and Recover','defending'),
  ('Press Escape and Retain','dribbling'),
  ('Contain, Match, Tackle','defending'),
  ('Jockey Channel Mirror','defending'),
  ('Aerial Timing and Safe Landing','aerial'),
  ('Back-Line Call and Shift','defending'),
  ('One-on-One Angle Narrowing','goalkeeping'),
  ('High-Ball Claim and Protect','goalkeeper_catch'),
  ('Keeper Four-Corner Footwork','keeper_set'),
  ('Distribution Accuracy Gates','distribution')
) as lesson(title, diagram_type)
where workout.title = lesson.title and cardinality(workout.positions) > 0;

update public.workouts
set step_by_step = case
      when diagram_type = 'shooting' then array['Choose a target before setting the ball.','Approach at a slight angle and plant beside it.','Lock the ankle and strike through the intended contact point.','Follow through toward the target and reset at walking pace.']
      when diagram_type in ('passing','switching','through_ball','wall_receive','distribution') then array['Scan the space and target before the ball arrives.','Open the body and set the non-kicking foot toward the chosen line.','Strike with a firm ankle through the intended part of the ball.','Follow the pass, recover, and prepare for the next picture.']
      when diagram_type in ('dribbling','cut_in') then array['Approach under control with short touches.','Keep the ball protected and lift the eyes before the marker.','Use one clear change of direction or pace.','Accelerate into space and reset with the other foot.']
      when diagram_type = 'movement' then array['Check the space before moving.','Move away briefly to shift the marker.','Curve into the passing lane at the right moment.','Arrive half-turned and ready for the next touch.']
      when diagram_type in ('defending','interception') then array['Start goal-side and scan the ball and central space.','Approach under control and keep a balanced side-on stance.','Protect the most dangerous lane and wait for the cue.','Step across only when the ball is exposed, then recover.']
      when diagram_type = 'aerial' then array['Track the flight early and adjust with small steps.','Load hips and knees before take-off.','Meet the ball at a safe, controlled point.','Land softly, regain balance, and reset.']
      when diagram_type in ('goalkeeping','keeper_set','goalkeeper_catch','keeper_reaction') then array['Start centred in a balanced ready stance.','Move with short steps and keep hands in view.','Track the ball and meet it in front of the body.','Secure or recover the ball, then reset to centre.']
      else step_by_step
    end,
    body_position = case
      when diagram_type = 'shooting' then 'Plant foot beside the ball and point it toward the target. Keep the ankle locked, chest balanced over the strike, and follow through toward the shot line.'
      when diagram_type in ('passing','switching','through_ball','wall_receive','distribution') then 'Stand half-turned to see the ball and target. Place the support foot beside the ball, point through the intended line, and keep the ankle firm through contact.'
      when diagram_type in ('dribbling','cut_in') then 'Keep knees softly bent, centre of gravity low, and the ball within one step. Use the arm naturally for balance and shield with the body when pressure is close.'
      when diagram_type = 'movement' then 'Stay light on the feet, check both shoulders, and curve the run. Arrive half-turned with the hips open to the next action.'
      when diagram_type in ('defending','interception') then 'Keep hips low, knees bent, and chest facing the attacker or passing lane. Stay goal-side, use short steps, and avoid reaching across the body.'
      when diagram_type = 'aerial' then 'Keep the head neutral, trunk braced, knees aligned over toes, and landing soft with hips back. Never add contact in solo work.'
      when diagram_type in ('goalkeeping','keeper_set','goalkeeper_catch','keeper_reaction') then 'Keep feet about shoulder-width, knees flexed, chest balanced over the base, and hands forward. Track the ball and move from the feet rather than reaching off balance.'
      else body_position
    end,
    common_mistakes = case
      when diagram_type = 'shooting' then array['Leaning back and lifting every shot.','Planting too far from the ball or swinging before choosing a target.']
      when diagram_type in ('passing','switching','through_ball','wall_receive','distribution') then array['Receiving square and needing extra touches to find the target.','Trying to force power before clean contact and early scanning.']
      when diagram_type in ('dribbling','cut_in') then array['Taking the ball too far ahead or staring down at it.','Performing a move without changing speed or protecting the next touch.']
      when diagram_type = 'movement' then array['Running in a straight line and making the run too early.','Checking the shoulder only after the pass has already been played.']
      when diagram_type in ('defending','interception') then array['Diving into a tackle or stepping into the lane too early.','Crossing the feet or opening the central route while tracking the ball.']
      when diagram_type = 'aerial' then array['Jumping before judging the flight.','Landing stiff-legged or letting the knees collapse inward.']
      when diagram_type in ('goalkeeping','keeper_set','goalkeeper_catch','keeper_reaction') then array['Setting with straight legs or hands behind the body.','Moving with large crossover steps before a controlled adjustment.']
      else common_mistakes
    end,
    coach_tip = case
      when diagram_type = 'shooting' then 'Pick the target before the run-up. Clean contact and a balanced follow-through create repeatable accuracy before power.'
      when diagram_type in ('passing','switching','through_ball','wall_receive','distribution') then 'Scan before receiving so the first touch and body shape already support the next pass. Weight and timing matter as much as range.'
      when diagram_type in ('dribbling','cut_in') then 'Sell the first action, change pace after the move, and keep the next option visible.'
      when diagram_type = 'movement' then 'The best run creates a new passing angle. Check early, move away, then arrive into the space at the right moment.'
      when diagram_type in ('defending','interception') then 'Protect the most dangerous space first. Patience and balance often create a safer moment to win the ball.'
      when diagram_type = 'aerial' then 'Practise timing and safe landing before adding height or contact.'
      when diagram_type in ('goalkeeping','keeper_set','goalkeeper_catch','keeper_reaction') then 'Set behind the ball, keep the hands ready, and recover to a balanced central position after every action.'
      else coach_tip
    end,
    skill_tags = case
      when diagram_type = 'shooting' then array['Shooting technique','Finishing accuracy','Balance']
      when diagram_type in ('passing','switching','through_ball','wall_receive','distribution') then array['Passing accuracy','Vision','First touch']
      when diagram_type in ('dribbling','cut_in') then array['Ball control','Dribbling','Decision-making']
      when diagram_type = 'movement' then array['Attacking movement','Positioning','Awareness']
      when diagram_type in ('defending','interception') then array['Defensive positioning','Marking','Decision-making']
      when diagram_type = 'aerial' then array['Aerial ability','Timing','Balance']
      when diagram_type in ('goalkeeping','keeper_set','goalkeeper_catch','keeper_reaction') then array['Goalkeeping','Handling','Footwork']
      else skill_tags
    end
where id::text like 'a1f10001-%' and cardinality(positions) > 0;