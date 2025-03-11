var seed = 1;

const seed_chars = '123456789QWERTYUIOPASDFGHJKLZXCVBNM';
const magic = [29, 23, 11, 19, 17];

// d3.select('p')
//     .attr('class', 'message')
//     .text('');

function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function seed_crc(code) {
  let crc = 0;
  for(let i=0;i<5;i++) {
    crc += magic[i] * seed_chars.indexOf(code[i]);
  }
  return crc;
}

function update_seed(_id) {
  let code = '';
  for(let i=0;i<2;i++)
    code += seed_chars[Math.floor(Math.random() * seed_chars.length)];
  crc = seed_crc(code);
  code += seed_chars[crc % seed_chars.length];
  // code += _id
  
  local_seed = code;
  return code;
}
function parse_code(_seed) {
    console.log(_seed);
    if(!_seed.match(/^([0-9A-Z]{1,8}-)*[0-9A-Z]{1,8}$/)){
        console.log('error');
        return null;
    }
    let parts = _seed.split('-');
    // let code = parts[0], crc = code[4];

    let res = [];
    for(let i=0;i<parts.length;i++){
        res.push(Number(parts[i]));
    }

    // if (seed_chars[seed_crc(code) % seed_chars.length] != crc) {
    //     console.log('error');
    //     return null;
    // }
    // let result = 0;
    // for (let i = 1; i < 5; i++)
    //     result = seed_chars.length * result + seed_chars.indexOf(code[i]);

    return {
        'dataset':res
        // 'dataset': Number(code.slice(5)),
        // 'seed': result,
        // 'characters': parts.length > 1 ? parts[1].split(',').map(Number) : []
    };
}



d3.csv('data/worlds.csv').then(worlds=>{

    d3.csv('data/heroes.csv').then(items => {
        
        function prepare_game(_seed) {
            // seed = _seed.seed;
            // console.log(seed);
            let sorted_items = [];
            let index_heroes = _seed.dataset.length ? _seed.dataset : items_collection.map(d => d.index);
            console.log(index_heroes);  // массив индексов
            console.log(items.map(d => d.index));  // индексы в items

            const dataGame = items.filter(d => index_heroes.includes(Number(d.index)));
            console.log(dataGame);
            
            for (let i = 0; i < dataGame.length; i++)
                sorted_items.push([random(), i]);

            let results = [];
            for (let i = 0; i < dataGame.length; i++) {
                try {
                    results.push(dataGame[sorted_items[i][1]]);
                } catch {
                    break;
                }
            }
            return results;
        }


        function start_game(data, href){
            // console.log('data: '+data)
            d3.select('title').text(name);
            
            // d3.select('i[class="fa fa-arrow-left"]').remove();
            d3.select("div[class='message']").remove();
            d3.selectAll('.item').remove();
            d3.select('div[class="copy-url"]').remove();
            d3.select('.item__hero').remove();
            // d3.select('.refresh-game').remove();
            d3.select("i[class='fa fa-play-circle refresh-game']").remove();
            // d3.select('span[name="back"]').append('i').attr('class', 'fa fa-arrow-left');
            d3.select('span[name="main"]').on('click', function(){
                document.location.href = document.location.origin+document.location.pathname;
            });


            d3.select('span[name="game"]').text(' (Своя коллекция)');
                
            let grid = d3.select('#game.grid');
            let grid1 = d3.select('#hero');

            grid.attr('game', name).attr('person', '');
            grid.style('--auto-grid-min-size', '').style('grid-auto-rows', '230px').style('grid-gap', '12px');
            
            d3.select("div[class='share-url']").append('div')
                .attr('class', 'copy-url')
                .append('input')
                .attr('type', 'text')
                .attr('class',"share-link")
                .attr('value', href);

            d3.select('div[class="copy-url"]')
                .on('click', function(){
                    document.querySelector('.share-link').focus()
                    document.querySelector('.share-link').select();
                    document.execCommand("copy");
                })
                .append('span')
                .attr('class', 'copy-link')
                .text(' Поделиться');


            grid.selectAll("div[class='item']").data(data).enter()
                .append("div")
                .attr('class', 'item')
                .style('background-size', 'cover')
                .style('background-position', "top")
                .style('background-image', d => "url("+ d['url']+")")
                // .append('img')
                // .attr('src', d => d['url'])
                .on('click', click);

            grid.selectAll("div")
                .append("div")
                .attr('class', 'item__details item__count')
                .text(d => d['hero']);
            
            grid1.attr('class', 'grid')
                .style("padding-bottom",'10px')
                .style('--auto-grid-min-size',11)
                .style('justify-items','center');

            grid1.append("div")
                .attr('class', 'item__hero')
                .style('background-size', 'cover')
                .style('background-repeat', 'no-repeat')
                .style('background-position', "top")
                .style('background-image', 'url("data/favicon.png")')
                .style('width','230px');
             
            d3.selectAll('div[class="item"]')
                .style('opacity', function(){
                    if(d3.select('#hero.grid').text() == ''){ return '0.5';} else {return '1';}
                });

            if(d3.select('#hero.grid').text() == ''){ 
                d3.selectAll("div[game='"+name+"']").selectAll('div[class="item"]')
                .on('mouseover', function(){
                    d3.select(this).style('opacity', '1');
                })
                .on('mouseout', function(){
                    d3.select(this).style('opacity', '0.5');
                });
            }
            function click(d){
                // let grid1 = d3.select('#hero');
                if (d3.select('#hero.grid').text() == ''){  
                    d3.select('#hero').select("div").append("i")
                    .attr('class', 'fa fa-refresh refresh fa-3x fa-fw')
                    .style('color', '#2c2c2c')
                    .on('click', refresh);
                    grid1.select("div").append("div")
                    .attr('class', 'item__who'); 

                    d3.select('#hero.grid').select('.item__who')
                        .text(d3.select(this).select('.item__details').text());
                    d3.select('#hero.grid').select('.item__hero')
                        .style('background-image', d3.select(this).style('background-image'));
                    d3.selectAll("div[game='"+name+"']").selectAll('div[class="item"]')
                        .style('opacity','1')
                        .on('mouseout', '');

                }
                else{
                d3.select(this)
                    .style('background', function (back){
                        if (d3.select(this).style('background-color') == "rgb(44, 44, 44)") { return 'url('+ d['url'] +')'; } else { return '#2c2c2c'; }
                    })
                    .style('background-size', 'cover')
                    .style('background-position', "top");
                }
                let c = 0
                d3.selectAll('.item')
                    .each(function (d, i) {
                        if (d3.select(this).style('background-color') == "rgb(44, 44, 44)") {
                          c+=1; 
                        }
                    });
                
                d3.select('span[name="count"]').text(" " + d3.selectAll('.item').size()-c +'/'+ d3.selectAll('.item').size() +"");
            };
            function refresh(){
                grid1.attr('class', '');

                let hash = document.location.hash.slice(1);
                let game = parse_code(hash);
                let results = prepare_game(game);
                start_game(results, document.location.href);
            }; 

            function refresh_game(g){
                let code = update_seed(g);
                console.log(g);
                let _seed = parse_code(local_seed);
                let seed = _seed.seed;
                
                let results = prepare_game(_seed);
                
                document.location.href = document.location.origin+document.location.pathname+'#'+code;
                start_game(results, document.location.href);
            }; 
        }

      
        // if (!document.location.href){
        //     document.location.href+='#Все'
        // }
        
        
        let hash = document.location.hash.slice(1);
        let game = parse_code(hash);
        console.log(hash, game);

        var items_collection = []
        const collection= d3.select('#collection.grid');
        collection.style('--auto-grid-min-size', '').style('grid-auto-rows', '230px').style('grid-gap', '12px');

        d3.select('span[name="back"]').append('i').attr('class', 'fa fa-home refresh-game');
        d3.select("i[class='fa fa-home refresh-game']")
        // d3.select("i[class='fa fa-arrow-left refresh-game']")
            .append("span")
            .attr('class', 'tooltiptext')
            .text('Вернуться на Главную');

        d3.select('a[name="home"]')
            .style('all','unset');

               
        d3.select('span[name="play"]')
            .append("i")
            .attr('class', 'fa fa-play-circle refresh-game')
            .style('color', '#2c2c2c')
            .on('click', create_game);

        d3.select("i[class='fa fa-play-circle refresh-game']")
            .append("span")
            .attr('class', 'tooltiptext')
            .text('Играть с коллекцией');


        d3.select('span[name="clear"]')
            .append("i")
            .attr('class', 'fa fa-refresh refresh-game')
            .style('color', '#2c2c2c')
            .on('click', function(){ 
                items_collection = [];
                collection.selectAll("div[class='item']").remove();
                document.location.href = document.location.origin + document.location.pathname;
            }

            );
        d3.select("i[class='fa fa-refresh refresh-game']")
            .append("span")
            .attr('class', 'tooltiptext')
            .text('Очистить коллекцию');

        console.log('from create');

            function create_game(){
                console.log(items_collection);
                let code = items_collection.map(d => String(d.index)).slice(0, 48).join('-'); // Кодируем выбор
                // let code = update_seed(dataNames.length+1) + '-' + characters; // Добавляем в код
                
                let _seed = parse_code(code);
                
                // let seed = _seed.dataset;
                // console.log(_seed);

                let results = prepare_game(_seed);
                console.log(results[0]);
                collection.selectAll("div[class='item']").remove();
                grid.selectAll("div[class='item']").remove();

                document.location.href = document.location.origin + document.location.pathname + '#' + code;
                start_game(results, document.location.href);
            }
            
            function show_collection(){
                collection.selectAll("div[class='item']").remove();
                collection.selectAll("div[class='item']").data(items_collection).enter()
                    .append("div")
                    .attr('class', 'item')
                    .style('background-size', 'cover')
                    .style('background-position', "top")
                    .style('background-image', item => "url("+ item['url']+")")
                    .on('dblclick', function(el){
                        items_collection.splice(items_collection.indexOf(d3.select(this)['_groups'][0][0]['__data__']), 1); 
                        d3.select(this).remove(); });;

                collection.selectAll("div")
                    .append("div")
                    .attr('class', 'item__details item__count')
                    .text(item => item['hero']);
            }
            
            function click_item(d){
                console.log(items_collection);
                if (!items_collection.includes(d)){
                    items_collection.push(d);
                    
                }
                d3.select(this).style('opacity', 1);
                show_collection();
            }
                     
            function click_world(d){
                let id_world = worlds.filter(row=> row['name']==d)[0]['index_world'];
                let heroes = items.filter(item => item['index_world']==id_world);


                let grid = d3.select('#items.grid');
                grid.selectAll("div[class='item']").remove();

                grid.attr('game', d).attr('person', '');
                grid.style('--auto-grid-min-size', '').style('grid-auto-rows', '230px').style('grid-gap', '12px');


                grid.selectAll("div[class='item']").data(heroes).enter()
                    .append("div")
                    .attr('class', 'item')
                    .style('background-size', 'cover')
                    .style('background-position', "top")
                    .style('background-image', item => "url("+ item['url']+")")
                    .style('opacity', 
                        function(el){
                        if (items_collection.includes(el)){ return 1}
                        else {return 0.5}
                        })
                    // .append('img')
                    // .attr('src', d => d['url'])
                    .on('click', click_item)
                    

                
                grid.selectAll("div")
                    .append("div")
                    .attr('class', 'item__details item__count')
                    .text(d => d['hero']);
            }

            function select_all(d){
                let id_world = worlds.filter(row=> row['name']==d)[0]['index_world'];
                let heroes = items.filter(item => item['index_world']==id_world);
                for (var i = heroes.length - 1; i >= 0; i--) {
                    if (!items_collection.includes(heroes[i])){
                        items_collection.push(heroes[i]);
                    }
                }
                show_collection();
            }

            let dataNames = d3.nest().key(d=>d.name).rollup(d=>d[0]).entries(worlds).map(d=>d.value['name']).slice(4,);

            
            let grid = d3.select('#worlds.grid');
            grid.attr('person', '');
            grid.style('--auto-grid-min-size', '')
                .style('grid-auto-rows', '230px')
                .style('grid-gap', '12px')
                .style('display','block')
                .style('width', 'auto')
                .style('float', 'left').style('margin-right', '10px');

            grid.selectAll("div[class='item']").data(dataNames).enter()
                .append("div")
                .attr('class', 'item')
                .on('click', click_world)
                .on('dblclick', select_all);;

            
            grid.selectAll("div")
                .append("div")
                .attr('class', 'item__details item__count')
                .text(d => d);

        if(game){
            console.log('from game');
            let results = prepare_game(game);
            // document.location.href+='?name='+results[1];
            start_game(results, document.location.href);
        }  
            
        
    });
    
  });