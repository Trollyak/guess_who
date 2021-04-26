var seed = 1;

const seed_chars = '123456789QWERTYUIOPASDFGHJKLZXCVBNM';
const magic = [29, 23, 11, 19, 17];

d3.select('p')
    .attr('class', 'message')
    .text('Добро пожаловать в игру — аналог настольной. Свяжись со своим оппонентом, вместе выберите мир, загадайте своих персонажей. Вам предстоит отгадывать персонажа противника, задавая односложные вопросы. Исключайте неподходящих персонажей, кликая по ним. Выигрывает тот, кто быстрее отгадает персонажа!\n');

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
  for(let i=0;i<4;i++)
    code += seed_chars[Math.floor(Math.random() * seed_chars.length)];
  crc = seed_crc(code);
  code += seed_chars[crc % seed_chars.length];
  code += _id
  
  local_seed = code;
  return code;
}
function parse_code(_seed) {
    if(!_seed.match(/^[1-9A-Z]{6}$/))
        return null;
    let code = _seed.slice(0, 4), crc = _seed[4];

    if(seed_chars[seed_crc(code) % seed_chars.length] != crc)
        return null;
    let result = 0;
    for(let i=1;i<5;i++)
        result = seed_chars.length * result + seed_chars.indexOf(_seed[i]);
    return {
        'dataset': Number(_seed.slice(5)),
        'seed': result
    };
}

d3.csv('data/data.csv').then(data=>{
    const dataAll = d3.nest().key(d=>d.index).rollup(d=>d[0]).entries(data).map(d=>d.value);

    function prepare_game(_seed) {
      seed = _seed.seed;
      let sorted_items = [];
      const dataGame = dataAll.filter(d=>d['index_world']==_seed.dataset);
      for(let i = 0; i < dataGame.length; i++)
        sorted_items.push([random(), i]);
      sorted_items.sort();

      let results = []
      for(let i=0;i<24;i++) {
        try{
            results.push(dataGame[sorted_items[i][1]]);
        }
        catch{
            break;
        }
      }
      console.log(dataGame);
      return [results, dataGame[0]['name']];
    }

    function start_game(results, href){
        let data = results[0];
        const name = results[1];
        console.log('data: '+data)

        d3.select('span').append('i').attr('class', 'fa fa-arrow-left');
        d3.select('span[name="game"]').text(" (" + name+")");
        d3.select('h1').on('click', function(){
            document.location.href = document.location.origin+document.location.pathname;
        });

        d3.select('p').remove();
        d3.selectAll('.item').remove();
        d3.select('div[class="copy-url"]').remove();
        d3.select('.item__hero').remove();

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
            .style('background', d => "url("+ d['url']+")")
            .style('background-size', 'cover')
            .style('background-position', "top")
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
            .style('background', 'url("https://yt3.ggpht.com/a/AATXAJxyWtLO7QfARavzu816l7ooofWWESYSgSfZAD2w=s900-c-k-c0xffffffff-no-rj-mo")')
            .style('background-size', 'cover')
            .style('background-position', "top")
            .style('width','236px');
         
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
                .on('click', refresh);
                grid1.select("div").append("div")
                .attr('class', 'item__who'); 

                d3.select('#hero.grid').select('.item__who')
                    .text(d3.select(this).select('.item__details').text());
                d3.select('#hero.grid').select('.item__hero')
                    .style('background', d3.select(this).style('background'));
                d3.selectAll("div[game='"+name+"']").selectAll('div[class="item"]')
                    .style('opacity','1')
                    .on('mouseout', '');

            }
            else{
            d3.select(this)
                .style('background', function (back){
                    if (d3.select(this).style('background-color') == "rgb(0, 0, 0)") { return 'url('+ d['url'] +')'; } else { return '#000'; }
                })
                .style('background-size', 'cover')
                .style('background-position', "top");
            }
            let c = 0
            d3.selectAll('.item')
                .each(function (d, i) {

                    if (d3.select(this).style('background-color') == "rgb(0, 0, 0)") {
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
    }
      
    
    if (!document.location.href)
        document.location.href+='#Все'
    
    let hash = document.location.hash.slice(1);
    let game = parse_code(hash);
    console.log(hash, game);

    if(game){
        let results = prepare_game(game);
        start_game(results, document.location.href);
    }
    else{
        const dataChoice = d3.nest().key(d=>d.name).rollup(d=>d[0]).entries(data).map(d=>d.value);
        
        dataGroups = d3.nest().key(d=>d.group).rollup(d=>d[0]).entries(dataChoice).map(d=>d.value)
        d3.select('p').append('nav').attr('id', 'primary_nav_wrap');
        d3.select('nav').append('ul');
        d3.select('ul').selectAll('li').data(dataGroups).enter()
            .append("li")
            .append("a")
            .attr('href', d => "#"+d['group'])
            .text(d => d['group'])
            .on('click', filterGame);
        
        function filterGame(g){
            d3.selectAll('a').style('background', '');
            
            d3.selectAll('.item').remove();
            const grid = d3.select('.grid');
            grid.style('--auto-grid-min-size', '18rem').style('grid-auto-rows', '400px');
            if (g['group'] != 'Все'){
                d3.select(this).style('background', '#ddd');
                grid.selectAll("div[class='item']").data(dataChoice.filter(d=>d['group']==g['group'])).enter()
                    .append("div")
                    .attr('class', 'item')
                    .style('background', d => "url("+ d['poster']+")")
                    .style('background-size', 'cover')
                    .style('background-position', "top")
                    .on('click', clickGame);
                
            }
            else{
                d3.select('a[href = "#Все"]').style('background', '#ddd');
                grid.selectAll("div[class='item']").data(dataChoice).enter()
                    .append("div")
                    .attr('class', 'item')
                    .style('background', d => "url("+ d['poster']+")")
                    .style('background-size', 'cover')
                    .style('background-position', "top")
                    .on('click', clickGame);
            }
            grid.selectAll("div")
                .append("div")
                .attr('class', 'item__details')
                .text(d => d['name']);
        }

        filterGame(dataGroups[0]);

        function clickGame(g){
            if (g['name'] === "Создать"){
                window.open(g['url'], '_blank').focus();
            }
            else if (g['name'] === "Оценить"){
                window.open(g['url'], '_blank').focus();
            }
            else{
                let code = update_seed(g['index_world']);
                
                let _seed = parse_code(local_seed);
                let seed = _seed.seed;
                
                let results = prepare_game(_seed);
                
                document.location.href = document.location.origin+document.location.pathname+'#'+code;
                start_game(results, document.location.href, results[1])
            }       
        };
    }
    
  });