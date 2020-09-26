import { global, keyMultiplier, p_on, quantum_level, poppers } from './vars.js';
import { vBind, clearElement, popover, powerCostMod, spaceCostMultiplier, messageQueue } from './functions.js';
import { unlockAchieve, alevel } from './achieve.js';
import { traits, races } from './races.js';
import { spatialReasoning } from './resources.js';
import { armyRating } from './civics.js';
import { payCosts, setAction, drawTech, bank_vault } from './actions.js';
import { checkRequirements, incrementStruct } from './space.js';
import { loc } from './locale.js';

const fortressModules = {
    prtl_fortress: {
        info: {
            name: loc('portal_fortress_name'),
            desc: loc('portal_fortress_desc'),
            repair(){
                let repair = 200;
                if (p_on['repair_droid']){
                    repair *= 0.95 ** p_on['repair_droid'];
                }
                return Math.round(repair);
            }
        },
        turret: {
            id: 'portal-turret',
            title(){
                let type = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 'portal_turret_title3' : 'portal_turret_title2') : 'portal_turret_title1';
                return loc(type);
            },
            desc(){
                let type = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 'portal_turret_title3' : 'portal_turret_title2') : 'portal_turret_title1';
                return `<div>${loc(type)}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('turret', offset, 350000, 1.28, 'portal'); },
                Copper(offset){ return spaceCostMultiplier('turret', offset, 50000, 1.28, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('turret', offset, 8000, 1.28, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('turret', offset, 15, 1.28, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('turret', offset, 28000, 1.28, 'portal'); }
            },
            powered(){
                return powerCostMod(global.tech['turret'] ? 4 + global.tech['turret'] : 4);
            },
            postPower(o){
                p_on['turret'] = global.portal.turret.on;
                vBind({el: `#fort`},'update');
            },
            effect(){
                let rating = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
                let power = $(this)[0].powered();
                return `<div>${loc('portal_turret_effect',[rating])}</div><div class="has-text-caution">${loc('minus_power',[power])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('turret','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.turret.on++;
                        p_on['turret']++;
                        vBind({el: `#fort`},'update');
                    }
                    return true;
                }
                return false;
            }
        },
        carport: {
            id: 'portal-carport',
            title: loc('portal_carport_title'),
            desc(){
                return loc('portal_carport_desc');
            },
            reqs: { portal: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('carport', offset, 250000, 1.3, 'portal'); },
                Cement(offset){ return spaceCostMultiplier('carport', offset, 18000, 1.3, 'portal'); },
                Oil(offset){ return spaceCostMultiplier('carport', offset, 6500, 1.3, 'portal'); },
                Plywood(offset){ return spaceCostMultiplier('carport', offset, 8500, 1.3, 'portal'); }
            },
            repair(){
                let repair = 180;
                if (p_on['repair_droid']){
                    repair *= 0.95 ** p_on['repair_droid'];
                }
                return Math.round(repair);
            },
            effect(){
                return `${loc('portal_carport_effect')}`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('carport','portal');
                    global.civic.hell_surveyor.display = true;
                    global.resource.Infernite.display = true;
                    if (!global.tech['infernite']){
                        global.tech['infernite'] = 1;
                    }
                    return true;
                }
                return false;
            }
        },
        war_droid: {
            id: 'portal-war_droid',
            title: loc('portal_war_droid_title'),
            desc(){
                return `<div>${loc('portal_war_droid_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('war_droid', offset, 495000, 1.26, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('war_droid', offset, 1250, 1.26, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('war_droid', offset, 18, 1.26, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('war_droid', offset, 37500, 1.26, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('war_droid', offset, 1, 1.26, 'portal'); }
            },
            powered(){ return powerCostMod(2); },
            effect(){
                return `<div>${loc('portal_war_droid_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('war_droid','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.war_droid.on++;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('portal_war_droid_flair')
        },
        repair_droid: {
            id: 'portal-repair_droid',
            title: loc('portal_repair_droid_title'),
            desc(){
                return `<div>${loc('portal_repair_droid_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('repair_droid', offset, 444000, 1.26, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('repair_droid', offset, 88000, 1.26, 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('repair_droid', offset, 17616, 1.26, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('repair_droid', offset, 666, 1.26, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('repair_droid', offset, 1, 1.15, 'portal'); }
            },
            powered(){ return powerCostMod(3); },
            effect(){
                return `<div>${loc('portal_repair_droid_effect',[5])}</div><div>${loc('portal_repair_droid_effect2',[5])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('repair_droid','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.repair_droid.on++;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('portal_repair_droid_flair')
        },
    },
    prtl_badlands: {
        info: {
            name: loc('portal_badlands_name'),
            desc: loc('portal_badlands_desc'),
        },
        war_drone: {
            id: 'portal-war_drone',
            title: loc('portal_war_drone_title'),
            desc(){
                return `<div>${loc('portal_war_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 3 },
            powered(){ return powerCostMod(5); },
            cost: {
                Money(offset){ return spaceCostMultiplier('war_drone', offset, 650000, 1.28, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('war_drone', offset, 60000, 1.28, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('war_drone', offset, 100000, 1.28, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('war_drone', offset, 25, 1.28, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('war_drone', offset, 1, 1.28, 'portal'); }
            },
            effect(){
                return `<div>${loc('portal_war_drone_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('war_drone','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.war_drone.on++;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('portal_war_drone_flair')
        },
        sensor_drone: {
            id: 'portal-sensor_drone',
            title: loc('portal_sensor_drone_title'),
            desc(){
                return `<div>${loc('portal_sensor_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { infernite: 2 },
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('sensor_drone', offset, 500000, 1.25, 'portal'); },
                Polymer(offset){ return spaceCostMultiplier('sensor_drone', offset, 25000, 1.25, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('sensor_drone', offset, 12500, 1.25, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('sensor_drone', offset, 100, 1.25, 'portal'); }
            },
            effect(){
                let bonus = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 50 : 20) : 10;
                let know = global.tech.infernite >= 6 ? 2500 : 1000;
                let sci_bonus = global.race['cataclysm'] ? `<div>${loc('space_moon_observatory_cata_effect',[2])}</div>` : `<div>${loc('space_moon_observatory_effect',[2])}</div><div>${loc('portal_sensor_drone_effect2',[2])}</div>`;
                let sci = global.tech['science'] >= 14 ? `<div>${loc('city_max_knowledge',[know])}</div>${sci_bonus}` : '';
                return `<div>${loc('portal_sensor_drone_effect',[bonus])}</div>${sci}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('sensor_drone','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.sensor_drone.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        attractor: {
            id: 'portal-attractor',
            title: loc('portal_attractor_title'),
            desc(){
                return `<div>${loc('portal_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 4 },
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('attractor', offset, 350000, 1.25, 'portal'); },
                Aluminium(offset){ return spaceCostMultiplier('attractor', offset, 175000, 1.25, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('attractor', offset, 90000, 1.25, 'portal'); },
            },
            effect(){
                return `<div>${loc('portal_attractor_effect1')}</div><div>${loc('portal_attractor_effect2',[global.resource.Soul_Gem.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('attractor','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.attractor.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    prtl_pit: {
        info: {
            name: loc('portal_pit_name'),
            desc: loc('portal_pit_desc'),
        },
        pit_mission: {
            id: 'portal-pit_mission',
            title: loc('portal_pit_mission_title'),
            desc: loc('portal_pit_mission_title'),
            reqs: { hell_pit: 1 },
            grant: ['hell_pit',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 5000000; },
                Helium_3(){ return 300000; },
                Deuterium(){ return 200000; }
            },
            effect: loc('portal_pit_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_pit_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        assault_forge: {
            id: 'portal-assault_forge',
            title: loc('portal_assault_forge_title'),
            desc: loc('portal_assault_forge_title'),
            reqs: { hell_pit: 2 },
            grant: ['hell_pit',3],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 10000000; },
                HellArmy(){
                    return Math.round(650 / armyRating(1,'hellArmy'));
                },
                Cement(){ return 10000000; },
                Adamantite(){ return 1250000; },
                Elerium(){ return 2400; },
                Stanene(){ return 900000; }
            },
            effect: loc('portal_assault_forge_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_assault_forge_result'),'info');
                    return true;
                }
                return false;
            }
        },
        soul_forge: {
            id: 'portal-soul_forge',
            title: loc('portal_soul_forge_title'),
            desc(){
                return `<div>${loc('portal_soul_forge_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_pit: 4 },
            no_queue(){ return global.portal.soul_forge.count < 1 ? false : true },
            queue_complete(){ return 1 - global.portal.soul_forge.count; },
            powered(){ return powerCostMod(30); },
            postPower(o){
                vBind({el: `#fort`},'update');
            },
            cost: {
                Money(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 25000000 : 0; },
                Graphene(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 1500000 : 0; },
                Infernite(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 25000 : 0; },
                Bolognium(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 100000 : 0; },
            },
            effect(){
                let desc = `<div>${loc('portal_soul_forge_effect',[global.resource.Soul_Gem.name])}</div>`;
                if (global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.count >= 1){
                    let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
                    if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                        cap *= 0.97 ** p_on['soul_attractor'];
                    }
                    desc = desc + `<div>${loc('portal_soul_forge_effect2',[global.portal.soul_forge.kills.toLocaleString(),Math.round(cap).toLocaleString()])}</div>`;
                }
                let soldiers = soulForgeSoldiers();
                return `${desc}<div><span class="has-text-caution">${loc('portal_soul_forge_soldiers',[soldiers])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.portal.soul_forge.count < 1){
                        incrementStruct('soul_forge','portal');
                        if (global.city.powered && global.city.power >= $(this)[0].powered()){
                            global.portal.soul_forge.on++;
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        gun_emplacement: {
            id: 'portal-gun_emplacement',
            title: loc('portal_gun_emplacement_title'),
            desc(){
                return `<div>${loc('portal_gun_emplacement_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gun: 1 },
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('gun_emplacement', offset, 4000000, 1.25, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('gun_emplacement', offset, 250000, 1.25, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('gun_emplacement', offset, 1200000, 1.25, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('gun_emplacement', offset, 200000, 1.25, 'portal'); },
            },
            effect(){
                let soldiers = global.tech.hell_gun >= 2 ? 2 : 1;
                let min = global.tech.hell_gun >= 2 ? 35 : 20;
                let max = global.tech.hell_gun >= 2 ? 75 : 40;
                return `<div>${loc('portal_gun_emplacement_effect',[soldiers])}</div><div>${loc('portal_gun_emplacement_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gun_emplacement','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.gun_emplacement.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        soul_attractor: {
            id: 'portal-soul_attractor',
            title: loc('portal_soul_attractor_title'),
            desc(){
                return `<div>${loc('portal_soul_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_pit: 5 },
            powered(){ return powerCostMod(4); },
            cost: {
                Money(offset){ return spaceCostMultiplier('soul_attractor', offset, 12000000, 1.25, 'portal'); },
                Stone(offset){ return spaceCostMultiplier('soul_attractor', offset, 23000000, 1.25, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('soul_attractor', offset, 314159, 1.25, 'portal'); },
                Vitreloy(offset){ return spaceCostMultiplier('soul_attractor', offset, 1618, 1.25, 'portal'); },
                Aerogel(offset){ return spaceCostMultiplier('soul_attractor', offset, 180000, 1.25, 'portal'); },
            },
            effect(){
                let link = global.tech.hell_pit >= 7 ? `<div>${loc('portal_soul_attractor_effect2',[3])}</div>` : ``;
                return `<div>${loc('portal_soul_attractor_effect',[40,120])}</div>${link}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('soul_attractor','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.soul_attractor.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    prtl_ruins: {
        info: {
            name: loc('portal_ruins_name'),
            desc: loc('portal_ruins_desc'),
            support: 'guard_post',
            prop(){
                let desc = ` - <span class="has-text-warning">${loc('portal_ruins_security')}:</span> <span class="has-text-caution">{{ on | filter('army') }}</span>`;
                desc = desc + ` - <span class="has-text-warning">${loc('portal_ruins_supressed')}:</span> <span class="has-text-caution">{{ on | filter('sup') }}</span>`;
                return desc;
            },
            filter(v,type){
                let sup = hellSupression('ruins');
                switch (type){
                    case 'army':
                        return Math.round(sup.rating);
                    case 'sup':
                        let supress = +(sup.supress * 100).toFixed(2);
                        return `${supress}%`;
                }
            }
        },
        ruins_mission: {
            id: 'portal-ruins_mission',
            title: loc('portal_ruins_mission_title'),
            desc: loc('portal_ruins_mission_title'),
            reqs: { hell_ruins: 1 },
            grant: ['hell_ruins',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 100000000; },
                Oil(){ return 500000; },
                Helium_3(){ return 500000; }
            },
            effect: loc('portal_ruins_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_ruins_mission_result'),'info');
                    global.portal['vault'] = { count: 0 };
                    global.portal['stonehedge'] = { count: 0 };
                    global.portal['archaeology'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        guard_post: {
            id: 'portal-guard_post',
            title: loc('portal_guard_post_title'),
            desc(){
                return `<div>${loc('portal_guard_post_title')}</div><div class="has-text-special">${loc('requires_soldiers')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_ruins: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('guard_post', offset, 8000000, 1.06, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('guard_post', offset, 6500000, 1.06, 'portal'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('guard_post', offset, 300000, 1.06, 'portal'); },
            },
            powered(){ return powerCostMod(5); },
            support(){ return 1; },
            effect(){
                let rating = Math.round(armyRating(1,'hellArmy',0));
                return `<div>${loc('portal_guard_post_effect1',[rating])}</div><div class="has-text-caution">${loc('portal_guard_post_effect2',[1,$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('guard_post','portal');
                    global.portal.guard_post.on++;
                    return true;
                }
                return false;
            },
            postPower(){
                vBind({el: `#srprtl_ruins`},'update');
                vBind({el: `#srprtl_gate`},'update');
            }
        },
        vault: {
            id: 'portal-vault',
            title: loc('portal_vault_title'),
            desc: loc('portal_vault_title'),
            reqs: { hell_ruins: 2 },
            condition(){
                return global.portal.vault.count >= 2 ? false : true;
            },
            cost: {
                Soul_Gem(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 0 || wiki ? 100 : 0; },
                Money(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 1 || wiki ? 250000000 : 0; },
                Adamantite(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 1 || wiki ? 12500000 : 0; },
                Orichalcum(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 1 || wiki ? 30000000 : 0; },
            },
            effect(){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count < 2 ? loc('portal_vault_effect',[100]) : loc('portal_vault_effect2'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('vault','portal');
                    if (global.portal.vault.count === 2){
                        global.tech.hell_ruins = 3;
                        global.resource.Codex.display = true;
                        global.resource.Codex.amount = 1;
                        messageQueue(loc('portal_vault_result'),'info');
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.portal.vault.count === 2){
                    drawTech();
                    renderFortress();
                    setTimeout(function(){
                        let id = 'portal-vault';
                        $(`#pop${id}`).hide();
                        if (poppers[id]){
                            poppers[id].destroy();
                        }
                        clearElement($(`#pop${id}`),true);
                    },250);
                }
            }
        },
        archaeology: {
            id: 'portal-archaeology',
            title: loc('portal_archaeology_title'),
            desc(){
                return `<div>${loc('portal_archaeology_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_ruins: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('archaeology', offset, 100000000, 1.25, 'portal'); },
                Titanium(offset){ return spaceCostMultiplier('archaeology', offset, 3750000, 1.25, 'portal'); },
                Mythril(offset){ return spaceCostMultiplier('archaeology', offset, 1250000, 1.25, 'portal'); },
            },
            powered(){ return powerCostMod(8); },
            effect(){
                return `<div>${loc('portal_archaeology_effect',[2])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('archaeology','portal');
                    global.civic.archaeologist.display = true;
                    if (global.city.power >= $(this)[0].powered()){
                        global.portal.archaeology.on++;
                        if (global.civic.d_job === 'unemployed'){
                            if (global.civic.free > 0){
                                let hired = global.civic.free - 2 < 0 ? 1 : 2;
                                global.civic.free -= hired;
                                global.civic.archaeologist.workers += hired;
                            }
                        }
                        else if (global.civic[global.civic.d_job].workers > 0){
                            let hired = global.civic[global.civic.d_job].workers - 2 < 0 ? 1 : 2;
                            global.civic[global.civic.d_job].workers -= hired;
                            global.civic.archaeologist.workers += hired;
                        }
                    }  
                    return true;
                }
                return false;
            }
        },
        arcology: {
            id: 'portal-arcology',
            title: loc('portal_arcology_title'),
            desc(){
                return `<div>${loc('portal_arcology_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { housing: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('arcology', offset, 180000000, 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('arcology', offset, 7500000, 1.22, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('arcology', offset, 2800000, 1.22, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('arcology', offset, 5500000, 1.22, 'portal'); },
                Nanoweave(offset){ return spaceCostMultiplier('arcology', offset, 650000, 1.22, 'portal'); },
            },
            powered(){ return powerCostMod(25); },
            effect(){
                let sup = hellSupression('ruins');
                let vault = spatialReasoning(bank_vault() * 8 * sup.supress);
                vault = +(vault).toFixed(0);
                let containers = Math.round(quantum_level) * 10;
                let container_string = `<div>${loc('plus_max_resource',[containers,loc('resource_Crates_name')])}</div><div>${loc('plus_max_resource',[containers,loc('resource_Containers_name')])}</div>`;
                return `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_citizens',[8])}</div><div>${loc('plus_max_resource',[5,loc('civics_garrison_soldiers')])}</div><div>${loc('portal_guard_post_effect1',[75])}</div>${container_string}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('arcology','portal');
                    if (global.city.power >= $(this)[0].powered()){
                        global['resource'][global.race.species].max += 8;
                        global.portal.arcology.on++;
                    }
                    return true;
                }
                return false;
            },
            post(){
                vBind({el: `#srprtl_ruins`},'update');
                drawTech();
            },
            postPower(){
                vBind({el: `#srprtl_ruins`},'update');
            }
        },
        hell_forge: {
            id: 'portal-hell_forge',
            title: loc('portal_hell_forge_title'),
            desc(){
                return `<div>${loc('portal_hell_forge_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { scarletite: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_forge', offset, 250000000, 1.15, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('hell_forge', offset, 1650000, 1.22, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('hell_forge', offset, 3800000, 1.22, 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('hell_forge', offset, 1200000, 1.22, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('hell_forge', offset, 280000, 1.22, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('hell_forge', offset, 5, 1.22, 'portal'); },
            },
            powered(){ return powerCostMod(12); },
            special: true,
            effect(){
                let sup = hellSupression('ruins');
                let craft = +(75 * sup.supress).toFixed(1);
                return `<div>${loc('portal_hell_forge_effect',[1])}</div><div>${loc('interstellar_stellar_forge_effect3',[3])}</div><div>${loc('interstellar_stellar_forge_effect',[craft])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('hell_forge','portal');
                    if (global.city.power >= $(this)[0].powered()){
                        global.portal.hell_forge.on++;
                        global.city.smelter.cap += 3;
                        global.city.smelter.Oil += 3;
                    }
                    return true;
                }
                return false;
            },
            post(){
                vBind({el: `#foundry`},'update');
            },
        },
        ancient_pillars: {
            id: 'portal-ancient_pillars',
            title: loc('portal_ancient_pillars_title'),
            desc: loc('portal_ancient_pillars_desc'),
            reqs: { hell_ruins: 2 },
            cost: {
                Harmony(){ return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? 1 : 0; },
                Scarletite(){ return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? Object.keys(global.pillars).length * 125000 + 1000000 : 0; },
            },
            no_queue(){ return true },
            effect(){
                if (Object.keys(global.pillars).length >= 1){
                    return `<div>${loc('portal_ancient_pillars_effect2',[Object.keys(races).length - 1,Object.keys(global.pillars).length])}</div>`;
                }
                else {
                    return `<div>${loc('portal_ancient_pillars_effect',[Object.keys(races).length - 1])}</div>`;
                }
            },
            action(){
                if (global.tech['pillars'] && global.tech.pillars === 1 && global.race.universe !== 'micro'){
                    if (payCosts($(this)[0].cost)){
                        global.pillars[global.race.species] = alevel();
                        global.tech.pillars = 2;
                        spatialReasoning(0,false,true);
                        calcPillar(true);
                        towerSize(true);
                        unlockAchieve('resonance');
                        return true;
                    }
                }
                return false;
            }
        },
    },
    prtl_gate: {
        info: {
            name: loc('portal_gate_name'),
            desc(){
                return `${loc('portal_gate_desc')} ${loc('portal_gate_closed')}`;
            },
            support: 'guard_post',
            hide_support: true,
            prop(){
                let desc = ` - <span class="has-text-warning">${loc('portal_ruins_security')}:</span> <span class="has-text-caution">{{ on | filter('army') }}</span>`;
                desc = desc + ` - <span class="has-text-warning">${loc('portal_ruins_supressed')}:</span> <span class="has-text-caution">{{ on | filter('sup') }}</span>`;
                return desc;
            },
            filter(v,type){
                let sup = hellSupression('gate');
                switch (type){
                    case 'army':
                        return Math.round(sup.rating);
                    case 'sup':
                        let supress = +(sup.supress * 100).toFixed(2);
                        return `${supress}%`;
                }
            }
        },
        gate_mission: {
            id: 'portal-gate_mission',
            title: loc('portal_gate_mission_title'),
            desc: loc('portal_gate_mission_title'),
            reqs: { high_tech: 18 },
            grant: ['hell_gate',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 250000000; },
                Knowledge(){ return 27500000; }
            },
            effect: loc('portal_gate_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_gate_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        west_tower: {
            id: 'portal-west_tower',
            title: loc('portal_west_tower'),
            desc(wiki){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < size || wiki){
                    return `<div>${loc('portal_west_tower')}</div><div class="has-text-special">${loc('requires_segmemts',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_west_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            no_queue(){ return global.portal.west_tower.count < towerSize() ? false : true },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.west_tower.count; },
            cost: {
                Money(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(10000000) : 0; },
                Stone(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(100000) : 0; },
                Uranium(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(1000) : 0; },
                Adamantite(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(18000) : 0; },
                Vitreloy(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(25000) : 0; },
                Soul_Gem(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? 1 : 0; },
                Scarletite(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(5000) : 0; },
            },
            effect(){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < size){
                    let remain = global.portal.hasOwnProperty('west_tower') ? size - global.portal.west_tower.count : size;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(){
                if (global.portal.west_tower.count < towerSize() && payCosts($(this)[0].cost)){
                    incrementStruct('west_tower','portal');
                    return true;
                }
                if (global.portal.west_tower.count >= towerSize()){
                    global.tech['wtower'] = 1;
                }
                return false;
            }
        },
        east_tower: {
            id: 'portal-east_tower',
            title: loc('portal_east_tower'),
            desc(wiki){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < size || wiki){
                    return `<div>${loc('portal_east_tower')}</div><div class="has-text-special">${loc('requires_segmemts',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_east_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            no_queue(){ return global.portal.east_tower.count < towerSize() ? false : true },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.east_tower.count; },
            cost: {
                Money(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(10000000) : 0; },
                Stone(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(100000) : 0; },
                Uranium(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(1000) : 0; },
                Adamantite(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(18000) : 0; },
                Vitreloy(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(25000) : 0; },
                Soul_Gem(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? 1 : 0; },
                Scarletite(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(5000) : 0; },
            },
            effect(){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < size){
                    let remain = global.portal.hasOwnProperty('east_tower') ? size - global.portal.east_tower.count : size;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(){
                if (global.portal.east_tower.count < towerSize() && payCosts($(this)[0].cost)){
                    incrementStruct('east_tower','portal');
                    return true;
                }
                if (global.portal.east_tower.count >= towerSize()){
                    global.tech['etower'] = 1;
                }
                return false;
            }
        },
        gate_turret: {
            id: 'portal-gate_turret',
            title: loc('portal_gate_turret_title'),
            desc(){
                return `<div>${loc('portal_gate_turret_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gate: 3 },
            powered(){ return powerCostMod(6); },
            cost: {
                Money(offset){ return spaceCostMultiplier('gate_turret', offset, 3750000, 1.22, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('gate_turret', offset, 4250000, 1.22, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('gate_turret', offset, 275, 1.22, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('gate_turret', offset, 850000, 1.22, 'portal'); },
            },
            effect(){
                let security = 100;
                if (global.race['holy']){
                    security *= 1 + (traits.holy.vars[1] / 100);
                }
                let min = global.tech.hell_gun >= 2 ? 65 : 40;
                let max = global.tech.hell_gun >= 2 ? 100 : 60;
                return `<div>${loc('portal_gate_turret_effect',[security])}</div><div>${loc('portal_gate_turret_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gate_turret','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.gate_turret.on++;
                    }
                    return true;
                }
                return false;
            },
            postPower(){
                vBind({el: `#srprtl_gate`},'update');
            }
        },
        infernite_mine: {
            id: 'portal-infernite_mine',
            title: loc('portal_infernite_mine_title'),
            desc(){
                return `<div>${loc('portal_infernite_mine_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gate: 4 },
            powered(){ return powerCostMod(5); },
            cost: {
                Money(offset){ return spaceCostMultiplier('infernite_mine', offset, 75000000, 1.26, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('infernite_mine', offset, 2450000, 1.26, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('infernite_mine', offset, 1650000, 1.26, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('infernite_mine', offset, 680000, 1.26, 'portal'); },
            },
            effect(){                
                let sup = hellSupression('gate');
                let mining = 0.5 * sup.supress;
                return `<div>${loc('portal_infernite_mine_effect',[+(mining).toFixed(3)])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('infernite_mine','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.infernite_mine.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    prtl_lake: {
        info: {
            name: loc('portal_lake_name'),
            desc: loc('portal_lake_desc'),
        },
        lake_mission: {
            id: 'portal-lake_mission',
            title: loc('portal_pit_mission_title'),
            desc: loc('portal_pit_mission_title'),
            reqs: { hell_lake: 1 },
            grant: ['hell_lake',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 350000000; },
                Oil(){ return 1000000; }
            },
            effect: loc('portal_pit_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_pit_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
    },
    prtl_spire: {
        info: {
            name: loc('portal_spire_name'),
            desc: loc('portal_spire_desc'),
        },
        spire_mission: {
            id: 'portal-spire_mission',
            title: loc('portal_pit_mission_title'),
            desc: loc('portal_pit_mission_title'),
            reqs: { hell_spire: 1 },
            grant: ['hell_spire',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 500000000; },
                Deuterium(){ return 1000000; }
            },
            effect: loc('portal_pit_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_pit_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
    }
};

const towerSize = (function(){
    var size;
    return function(recalc){
        if (size && !recalc){
            return size;
        }
        size = 1000;
        if (global.hasOwnProperty('pillars')){
            Object.keys(global.pillars).forEach(function(pillar){
                if (global.pillars[pillar]){
                    size -= 12;
                }
            });            
        }
        return size;
    }
})();

function towerPrice(cost){
    let sup = hellSupression('gate');
    return Math.round(cost / (sup.supress > 0.01 ? sup.supress : 0.01));
}

export function soulForgeSoldiers(){
    let soldiers = Math.round(650 / armyRating(1,'hellArmy'));
    if (p_on['gun_emplacement']){
        soldiers -= p_on['gun_emplacement'] * (global.tech.hell_gun >= 2 ? 2 : 1);
        if (soldiers < 0){
            soldiers = 0;
        }
    }
    return soldiers;
}

export function fortressTech(){
    return fortressModules;
}

export function renderFortress(){
    let parent = $('#portal');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_portal')}</h2>`));
    if (!global.tech['portal'] || global.tech['portal'] < 2){
        return;
    }

    Object.keys(fortressModules).forEach(function (region){
        let show = region.replace("prtl_","");
        if (global.settings.portal[`${show}`]){
            let name = typeof fortressModules[region].info.name === 'string' ? fortressModules[region].info.name : fortressModules[region].info.name();
            
            let property = ``;
            if (fortressModules[region].info.hasOwnProperty('prop')){
                property = fortressModules[region].info.prop();
            }

            if (fortressModules[region].info['support']){
                let support = fortressModules[region].info['support'];
                if (fortressModules[region].info['hide_support']){
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span>${property}</div></div>`);
                }
                vBind({
                    el: `#sr${region}`,
                    data: global.portal[support],
                    filters: {
                        filter(){
                            return fortressModules[region].info.filter(...arguments);
                        }
                    }
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
            }

            popover(region, function(){
                    return typeof fortressModules[region].info.desc === 'string' ? fortressModules[region].info.desc : fortressModules[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            if (region === 'prtl_fortress'){
                buildFortress(parent,true);
                buildFortress($('#fortress'),false);
            } 

            Object.keys(fortressModules[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(fortressModules,region,tech)){
                    let c_action = fortressModules[region][tech];
                    setAction(c_action,'portal',tech);
                }
            });
        }
    });
}

function buildFortress(parent,full){
    let id = full ? 'fort' : 'gFort';
    let fort = full ? $(`<div id="${id}" class="fort"></div>`) : $('#gFort');
    if (full){
        parent.append(fort);
    }
    else {
        if (fort.length > 0){
            clearElement(fort);
        }
        else {
            fort = $(`<div id="${id}" class="fort gFort"></div>`);
            parent.append(fort);
        }
        fort.append(`<div><h3 class="has-text-warning">${loc('portal_fortress_name')}</h3></div>`);
    }
    

    let status = $('<div></div>');
    fort.append(status);

    let defense = $(`<span class="defense has-text-success" :aria-label="defense()">${loc('fortress_defense')} {{ f.garrison | defensive }}</span>`);
    status.append(defense);
    let activity = $(`<b-tooltip :label="hostiles()" position="is-bottom" multilined animated><span class="has-text-danger pad" :aria-label="hostiles()">${loc('fortress_spotted')} {{ f.threat }}</span></b-tooltip>`);
    status.append(activity);
    let threatLevel = $(`<b-tooltip :label="threatLevel()" position="is-bottom" multilined animated><span :class="threaten()" :aria-label="threatLevel()">{{ f.threat | threat }}</span></b-tooltip>`);
    status.append(threatLevel);

    let wallStatus = $('<div></div>');
    fort.append(wallStatus);

    wallStatus.append($(`<span class="has-text-warning" :aria-label="defense()">${loc('fortress_wall')} <span :class="wall()">{{ f.walls }}%</span></span>`))

    let station = $(`<div></div>`);
    fort.append(station);
    
    station.append($(`<span>${loc('fortress_army')}</span>`));
    station.append($('<span role="button" aria-label="remove soldiers from the fortress" class="sub has-text-danger" @click="aLast"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="armyLabel()" position="is-bottom" multilined animated><span class="current">{{ f.garrison | patrolling }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="add soldiers to the fortress" class="add has-text-success" @click="aNext"><span>&raquo;</span></span>'));
    
    station.append($(`<span>${loc('fortress_patrol')}</span>`));
    station.append($('<span role="button" aria-label="reduce number of patrols" class="sub has-text-danger" @click="patDec"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="patLabel()" position="is-bottom" multilined animated><span class="current">{{ f.patrols }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="increase number of patrols" class="add has-text-success" @click="patInc"><span>&raquo;</span></span>'));

    station.append($(`<span>${loc('fortress_patrol_size')}</span>`));
    station.append($('<span role="button" aria-label="reduce size of each patrol" class="sub has-text-danger" @click="patSizeDec"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="patSizeLabel()" position="is-bottom" multilined animated><span class="current">{{ f.patrol_size }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="increase size of each patrol" class="add has-text-success" @click="patSizeInc"><span>&raquo;</span></span>'));

    station.append($(`<b-tooltip :label="hireLabel()" size="is-small merctip" position="is-bottom" animated><button v-show="g.mercs" class="button merc" @click="hire">${loc('civics_garrison_hire_mercenary')}</button></b-tooltip>`));

    let color = global.settings.theme === 'light' ? ` type="is-light"` : ` type="is-dark"`;
    let reports = $(`<div></div>`);
    station.append(reports);
    reports.append($(`<b-checkbox class="patrol" v-model="f.notify" true-value="Yes" false-value="No"${color}>${loc('fortress_patrol_reports')}</b-checkbox>`));
    reports.append($(`<b-checkbox class="patrol" v-model="f.s_ntfy" true-value="Yes" false-value="No"${color}>${loc('fortress_surv_reports')}</b-checkbox>`));

    if (full){
        fort.append($(`<div class="training"><span>${loc('civics_garrison_training')}</span> <progress class="progress" :value="g.progress" max="100">{{ g.progress }}%</progress></div>`));
    }

    vBind({
        el: `#${id}`,
        data: {
            f: global.portal.fortress,
            g: global.civic.garrison
        },
        methods: {
            defense(){
                return loc('fortress_defense');
            },
            hostiles(){
                if (global.portal.fortress.threat >= 2000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_high')}`;
                }
                else if (global.portal.fortress.threat < 1000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_low')}`;
                }
                else {
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_medium')}`;
                }
            },
            armyLabel(){
                return loc('fortress_stationed');
            },
            patLabel(){
                return loc('fortress_patrol_desc',[global.portal.fortress.patrols]);
            },
            patSizeLabel(){
                return loc('fortress_patrol_size_desc',[global.portal.fortress.patrol_size]);
            },
            threatLevel(){
                let t = global.portal.fortress.threat;
                if (t < 1000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level1')}`;
                }
                else if (t < 1500){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level2')}`;
                }
                else if (t >= 5000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level6')}`;
                }
                else if (t >= 3000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level5')}`;
                }
                else if (t >= 2000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level4')}`;
                }
                else {
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level3')}`;
                }
            },
            aNext(){
                let inc = keyMultiplier();
                if (global.portal.fortress.garrison < global.civic.garrison.workers){
                    global.portal.fortress.garrison += inc;
                    if (global.portal.fortress.garrison > global.civic.garrison.workers){
                        global.portal.fortress.garrison = global.civic.garrison.workers;
                    }
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            aLast(){
                let dec = keyMultiplier();
                let min = global.portal.fortress.patrols * global.portal.fortress.patrol_size;
                if (p_on['soul_forge']){
                    min += soulForgeSoldiers();
                }
                if (global.portal.hasOwnProperty('guard_post')){
                    min += global.portal.guard_post.on;
                }
                if (global.portal.fortress.garrison > min){
                    global.portal.fortress.garrison -= dec;
                    if (global.portal.fortress.garrison < min){
                        global.portal.fortress.garrison = min;
                    }
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            patInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrols * global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrols += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrols > 0){
                    global.portal.fortress.patrols -= dec;
                    if (global.portal.fortress.patrols < 0){
                        global.portal.fortress.patrols = 0;
                    }
                }
            },
            patSizeInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrol_size += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patSizeDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrol_size > 1){
                    global.portal.fortress.patrol_size -= dec;
                    if (global.portal.fortress.patrol_size < 1){
                        global.portal.fortress.patrol_size = 1;
                    }
                }
            },
            wall(){
                let val = global.portal.fortress.walls;
                if (val >= 75){
                    return "has-text-success";
                }
                else if (val <= 25){
                    return "has-text-danger";
                }
                else {
                    return "has-text-warning";
                }
            },
            threaten(){
                let val = global.portal.fortress.threat;
                if (val < 1000){
                    return "has-text-success";
                }
                else if (val >= 2000){
                    return "has-text-danger";
                }
                else {
                    return "has-text-warning";
                }
            },
            hire(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.civic.garrison.m_use > 0){
                    cost *= 1.1 ** global.civic.garrison.m_use;
                }
                if (global.race['brute']){
                    cost = cost / 2;
                }
                cost = Math.round(cost);
                if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost){
                    global.resource.Money.amount -= cost;
                    global.civic['garrison'].workers++;
                    global.civic.garrison.m_use++;
                    global.portal.fortress.garrison++;
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            hireLabel(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.civic.garrison.m_use > 0){
                    cost *= 1.1 ** global.civic.garrison.m_use;
                }
                if (global.race['brute']){
                    cost = cost / 2;
                }
                cost = Math.round(cost);
                return loc('civics_garrison_hire_mercenary_cost',[cost]);
            }
        },
        filters: {
            defensive(v){
                return fortressDefenseRating(v);
            },
            patrolling(v){
                let stationed =  v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                if (p_on['soul_forge']){
                    let forge = soulForgeSoldiers();
                    if (forge <= stationed){
                        stationed -= forge;
                    }
                }
                if (global.portal.hasOwnProperty('guard_post')){
                    stationed -= global.portal.guard_post.on;
                }
                return stationed;
            },
            threat(t){
                if (t < 1000){
                    return loc('fortress_threat_level1');
                }
                else if (t < 1500){
                    return loc('fortress_threat_level2');
                }
                else if (t >= 5000){
                    return loc('fortress_threat_level6');
                }
                else if (t >= 3000){
                    return loc('fortress_threat_level5');
                }
                else if (t >= 2000){
                    return loc('fortress_threat_level4');
                }
                else {
                    return loc('fortress_threat_level3');
                }
            }
        }
    });
}

function fortressDefenseRating(v){
    let army = v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
    if (p_on['soul_forge']){
        let forge = soulForgeSoldiers();
        if (forge <= army){
            army -= forge;
        }
    }
    if (global.portal.hasOwnProperty('guard_post')){
        army -= global.portal.guard_post.on;
    }
    let wounded = 0;
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.portal.fortress.garrison){
        wounded = global.civic.garrison.wounded - (global.civic.garrison.workers - global.portal.fortress.garrison);
        if (wounded > army){
            wounded = army;
        }
    }
    if (p_on['war_droid']){
        let droids = p_on['war_droid'] - global.portal.fortress.patrols > 0 ? p_on['war_droid'] - global.portal.fortress.patrols : 0;
        army += global.tech['hdroid'] ? droids * 2 : droids;
    }
    let turret = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
    return Math.round(armyRating(army,'hellArmy',wounded)) + (p_on['turret'] ? p_on['turret'] * turret : 0);
}

function casualties(demons,pat_armor,ambush){
    let casualties = Math.round(Math.log2((demons / global.portal.fortress.patrol_size) / (pat_armor || 1))) - Math.rand(0,pat_armor);
    let dead = 0;
    if (casualties > 0){
        if (casualties > global.portal.fortress.patrol_size){
            casualties = global.portal.fortress.patrol_size;
        }
        casualties = Math.rand(ambush ? 1 : 0,casualties + 1);
        dead = Math.rand(0,casualties + 1);
        let wounded = casualties - dead;
        global.civic.garrison.wounded += wounded;
        global.civic.garrison.workers -= dead;
        global.stats.died += dead;
    }
    return dead;
}

export function bloodwar(){
    let pat_armor = global.tech['armor'] ? global.tech['armor'] : 0;
    if (global.race['armored']){
        pat_armor += traits.armored.vars[1];
    }
    if (global.race['scales']){
        pat_armor += traits.scales.vars[2];
    }

    let forgeOperating = false;                    
    if (p_on['soul_forge']){
        let troops = global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
        let forge = soulForgeSoldiers();
        if (forge <= troops){
            forgeOperating = true;
            $(`#portal-soul_forge .on`).removeClass('altwarn');
        }
        else {
            forgeOperating = false;
            $(`#portal-soul_forge .on`).addClass('altwarn');
        }
    }
    else {
        $(`#portal-soul_forge .on`).addClass('altwarn');
    }

    // Drones
    if (global.tech['portal'] >= 3 && p_on['war_drone']){
        for (let i=0; i<p_on['war_drone']; i++){
            if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
                let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));
                let killed = global.tech.portal >= 7 ? Math.rand(50,125) : Math.rand(25,75);
                let remain = demons - killed;
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                    global.stats.dkills += demons - remain;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons - remain;
                    }
                }
                else {
                    global.portal.fortress.threat -= demons;
                    global.stats.dkills += demons;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons;
                    }
                }
            }
        }
    }

    if (!global.portal.fortress['pity']){
        global.portal.fortress['pity'] = 0;
    }

    let game_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 9000 : 10000;
    let gem_chance = game_base - global.portal.fortress.pity;
    if (global.race.universe === 'evil' && global.race.Dark.count > 0){
        let de = global.race.Dark.count;
        if (global.race.Harmony.count > 0){
            de *= 1 + (global.race.Harmony.count * 0.01);
        }
        gem_chance -= Math.round(Math.log2(de) * 2);
    }
    
    if (global.tech['portal'] >= 4 && p_on['attractor']){
        for (let i=0; i<p_on['attractor']; i++){
            gem_chance = Math.round(gem_chance * 0.92);
        }
    }
    if (global.race['ghostly']){
        gem_chance = Math.round(gem_chance * ((100 - traits.ghostly.vars[2]) / 100));
    }

    // Patrols
    let dead = 0;
    let terminators = p_on['war_droid'] ? p_on['war_droid'] : 0;
    let failed_drop = false;
    let wounded = 0;
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.portal.fortress.garrison){
        wounded = global.civic.garrison.wounded - (global.civic.garrison.workers - global.portal.fortress.garrison);
        if (wounded > global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size)){
            wounded -= global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
            wounded /= global.portal.fortress.patrols;
        }
        else {
            wounded = 0;
        }
    }
    let brkpnt = +(wounded % 1).toFixed(10);
    for (let i=0; i<global.portal.fortress.patrols; i++){
        let hurt = brkpnt > (1 / global.portal.fortress.patrols * i) ? Math.ceil(wounded) : Math.floor(wounded);
        if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
            let pat_size = global.portal.fortress.patrol_size;
            if (terminators > 0){
                pat_size += global.tech['hdroid'] ? 2 : 1;
                terminators--;
            }
            let pat_rating = Math.round(armyRating(pat_size,'hellArmy',hurt));

            let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));

            if (global.race['frenzy']){
                global.race['frenzy'] += Math.rand(0,Math.ceil(demons / 10));
                if (global.race['frenzy'] > 1000000){
                    global.race['frenzy'] = 1000000;
                }
            }

            if (Math.rand(0,global.race['chameleon'] || global.race['elusive'] ? 50 : 30) === 0){
                dead += casualties(Math.round(demons * (1 + Math.random() * 3)),0,true);
                let remain = demons - Math.round(pat_rating / 2);
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                    global.stats.dkills += demons - remain;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons - remain;
                    }
                }
                else {
                    global.portal.fortress.threat -= demons;
                    global.stats.dkills += demons;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons;
                    }
                }
            }
            else {
                let remain = demons - pat_rating;
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                    global.stats.dkills += demons - remain;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons - remain;
                    }
                    dead += casualties(remain,pat_armor,false);
                }
                else {
                    global.portal.fortress.threat -= demons;
                    global.stats.dkills += demons;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons;
                    }
                }
                if (Math.rand(0,gem_chance) === 0){
                    global.resource.Soul_Gem.amount++;
                    global.portal.fortress.pity = 0;
                    if (!global.resource.Soul_Gem.display){
                        global.resource.Soul_Gem.display = true;
                        messageQueue(loc('portal_first_gem'),'info');
                    }
                }
                else {
                    failed_drop = true;
                }
            }
        }
    }

    let revive = 0;
    if (global.race['revive']){
        revive = Math.round(Math.seededRandom(0,(dead / 3) + 0.25));
        global.civic.garrison.workers += revive;
    }

    // Soldier Rebalancing
    if (global.civic.garrison.wounded > global.civic.garrison.workers){
        global.civic.garrison.wounded = global.civic.garrison.workers;
    }
    if (global.civic.garrison.workers < global.portal.fortress.garrison){
        global.portal.fortress.garrison = global.civic.garrison.workers;
    }
    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
    }

    if (dead > 0 && global.portal.fortress.notify === 'Yes'){
        if (revive > 0){
            messageQueue(loc('fortress_patrol_casualties_revive',[dead,revive]));
        }
        else {
            messageQueue(loc('fortress_patrol_casualties',[dead]));
        }
    }
    
    if (failed_drop && global.portal.fortress.pity < 10000){
        global.portal.fortress.pity++;
    }

    // Siege Chance
    if (global.portal.fortress.garrison > 0 && global.portal.fortress.siege > 0){
        global.portal.fortress.siege--;
    }
    if (global.portal.fortress.siege <= 900 && global.portal.fortress.garrison > 0 && 1 > Math.rand(0,global.portal.fortress.siege)){
        let defense = fortressDefenseRating(global.portal.fortress.garrison);
        let defend = defense / 35 > 1 ? defense / 35 : 1;
        let siege = Math.round(global.portal.fortress.threat / 2);

        let damage = 0;
        let killed = 0;
        let destroyed = false;
        while (siege > 0 && global.portal.fortress.walls > 0){
            let terminated = Math.round(Math.rand(1,defend + 1));
            if (terminated > siege){
                terminated = siege;
            }
            siege -= terminated;
            global.portal.fortress.threat -= terminated;
            global.stats.dkills += terminated;
            if (forgeOperating){
                global.portal.soul_forge.kills += terminated;
            }
            killed += terminated;
            if (siege > 0){
                damage++;
                global.portal.fortress.walls--;
                if (global.portal.fortress.walls === 0){
                    destroyed = true;
                    break;
                }
            }
        }

        if (destroyed){
            messageQueue(loc('fortress_lost'));
            global.resource[global.race.species].amount -= global.civic.hell_surveyor.workers;
            global.civic.hell_surveyor.workers = 0;
            global.civic.hell_surveyor.assigned = 0;

            global.portal.fortress.patrols = 0;
            global.stats.died += global.portal.fortress.garrison;
            global.civic.garrison.workers -= global.portal.fortress.garrison;
            global.portal.fortress.garrison = 0;
            global.portal.fortress['assigned'] = 0;
        }
        else {
            messageQueue(loc('fortress_sieged',[killed,damage]));
        }

        global.portal.fortress.siege = 999;
    }

    if (global.portal.fortress.threat < 10000){
        let influx = ((10000 - global.portal.fortress.threat) / 2500) + 1;
        if (global.tech['portal'] >= 4 && p_on['attractor']){
            influx *= 1 + (p_on['attractor'] * 0.22);
        }
        global.portal.fortress.threat += Math.rand(Math.round(10 * influx),Math.round(50 * influx));
    }

    // Surveyor threats
    if (global.civic.hell_surveyor.display && global.civic.hell_surveyor.workers > 0){
        let divisor = 1000;
        if (global.race['blurry']){
            divisor *= 1 + (traits.blurry.vars[0] / 100);
        }
        if (global.tech['infernite'] && global.tech.infernite >= 5){
            divisor += 250;
        }
        let danger = global.portal.fortress.threat / divisor;
        let exposure = global.civic.hell_surveyor.workers > 10 ? 10 : global.civic.hell_surveyor.workers;
        let risk = 10 - (Math.rand(0,exposure + 1));

        if (danger > risk){
            let cap = Math.round(danger);
            let dead = Math.rand(0,cap + 1);
            if (dead > global.civic.hell_surveyor.workers){
                dead = global.civic.hell_surveyor.workers;
            }
            if (dead === 1 && global.portal.fortress.s_ntfy === 'Yes'){
                messageQueue(loc('fortress_killed'));
            }
            else if (dead > 1 && global.portal.fortress.s_ntfy === 'Yes'){
                messageQueue(loc('fortress_eviscerated',[dead]));
            }
            if (dead > 0){
                global.civic.hell_surveyor.workers -= dead;
                global.resource[global.race.species].amount -= dead;
                global.portal.carport.damaged += dead;
            }
        }
    }

    if (global.stats.dkills >= 1000000 && global.tech['gateway'] && !global.tech['hell_pit']){
        global.tech['hell_pit'] = 1;
        global.settings.portal.pit = true;
        messageQueue(loc('portal_hell_pit_found'),'info');
        renderFortress();
    }

    if (global.tech['hell_pit']){
        if (forgeOperating && global.tech.hell_pit >= 5 && p_on['soul_attractor']){
            global.portal.soul_forge.kills += p_on['soul_attractor'] * Math.rand(40,120);
        }

        if (forgeOperating && global.tech['hell_gun'] && p_on['gun_emplacement']){
            let gunKills = 0;
            for (let i=0; i<p_on['gun_emplacement']; i++){
                gunKills += global.tech.hell_gun >= 2 ? Math.rand(35,75) : Math.rand(20,40);
            }
            global.portal.soul_forge.kills += gunKills;
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 6750 : 7500;
            if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                gun_base *= 0.94 ** p_on['soul_attractor'];
            }
            for (let i=0; i<p_on['gun_emplacement']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    global.resource.Soul_Gem.amount++;
                }
            }
        }

        if (forgeOperating){
            let forgeKills = Math.rand(25,150);
            global.stats.dkills += forgeKills;
            global.portal.soul_forge.kills += forgeKills;
            let forge_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 4500 : 5000;
            if (Math.rand(0,forge_base) === 0){
                global.resource.Soul_Gem.amount++;
            }
        }

        let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
        if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
            cap *= 0.97 ** p_on['soul_attractor'];
        }
        if (forgeOperating && global.portal.soul_forge.kills >= Math.round(cap)){
            global.portal.soul_forge.kills = 0;
            let c_max = 10 - p_on['soul_attractor'] > 0 ? 10 - p_on['soul_attractor'] : 1;
            if (global.tech.high_tech >= 16 && !global.tech['corrupt'] && Math.rand(0,c_max + 1) === 0){
                global.resource.Corrupt_Gem.amount++;                  
                global.resource.Corrupt_Gem.display = true;
                messageQueue(loc('portal_corrupt_gem'),'info');
                global.tech['corrupt'] = 1;
                drawTech();
            }
            else {
                global.resource.Soul_Gem.amount++;
            }
        }
    }

    if (global.tech['gate_turret']){
        if (forgeOperating && p_on['gate_turret']){
            let gunKills = 0;
            let min = global.tech.hell_gun >= 2 ? 65 : 40;
            let max = global.tech.hell_gun >= 2 ? 100 : 60;
            for (let i=0; i<p_on['gate_turret']; i++){
                gunKills += Math.rand(min,max);
            }
            global.portal.soul_forge.kills += gunKills;
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 2700 : 3000;
            for (let i=0; i<p_on['gate_turret']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    global.resource.Soul_Gem.amount++;
                }
            }
        }
    }
}

export function hellSupression(area, val){
    switch (area){
        case 'ruins':
            {
                let army = val || p_on['guard_post'];
                let arc = (p_on['arcology'] || 0) * 75;
                let aRating = armyRating(army,'hellArmy',0);
                if (global.race['holy']){
                    aRating *= 1 + (traits.holy.vars[1] / 100);
                }
                let supress = (aRating + arc) / 5000;
                return {
                    supress: supress > 1 ? 1 : supress,
                    rating: aRating + arc
                };
            }
        case 'gate':
            {
                let gSup = hellSupression('ruins',val);
                let turret = (p_on['gate_turret'] || 0) * 100;
                if (global.race['holy']){
                    turret *= 1 + (traits.holy.vars[1] / 100);
                }
                let supress = (gSup.rating + turret) / 7500;
                return {
                    supress: supress > 1 ? 1 : supress,
                    rating: gSup.rating + turret
                };
            }
        default:
            return 0;
    }
}
