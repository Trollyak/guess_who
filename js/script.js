d3.select('p')
    .attr('class', 'message')
    .text('Добро пожаловать в игру — аналог настольной. Свяжись со своим оппонентом, вместе выберите мир, загадайте своих персонажей. Вам предстоит отгадывать персонажа противника, задавая односложные вопросы. Исключайте неподходящих персонажей, кликая по ним. Выигрывает тот, кто быстрее отгадает персонажа!');

d3.csv('data/data.csv').then(data=>{
    dataChoice = d3.nest().key(d=>d.name).rollup(d=>d[0]).entries(data).map(d=>d.value);
    const grid = d3.select('.grid');
    grid.style('--auto-grid-min-size', '18rem').style('grid-auto-rows', '400px');
    grid.selectAll("div[class='item']").data(dataChoice).enter()
        .append("div")
        .attr('class', 'item')
        .style('background', d => "url("+ d['poster']+")")
        .style('background-size', 'cover')
        .style('background-position', "top")
        .on('click', clickGame);;
    grid.selectAll("div")
        .append("div")
        .attr('class', 'item__details')
        .text(d => d['name']);
    // d3.selectAll("div[class='item__details']")
    //     .each(function (d, i) {
    //         console.log(i)
    //         if (i !== 0 && i !== 1) {
    //           // put all your operations on the second element, e.g.
    //           d3.select(this).attr('class', 'item__details item__count'); 
    //         }
    //     });
    function clickGame(g){
        if (g['name'] === "Создать"){
            window.open(g['url'], '_blank').focus();
        }
        else if (g['name'] === "Оценить"){
            window.open(g['url'], '_blank').focus();
        }
        else{
            d3.select('span').append('i').attr('class', 'fa fa-arrow-left');
            d3.select('span[name="game"]').text(" (" + g['name']+")");
            d3.select('h1').on('click', function(){
                window.location.reload();
            });
            grid.attr('game', g['name']).attr('person', '');

            const grid1 = d3.select('#hero');
            generate();

            function generate(){
                d3.select('p').remove();
                d3.selectAll('.item').remove();
                grid.style('--auto-grid-min-size', '').style('grid-auto-rows', '230px').style('grid-gap', '12px');
                dataGame = d3.nest().key(d=>d.index).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['name']==g['name']);

                console.log(d3.nest().key(d=>d.index).rollup(d=>d[0]).entries(data).map(d=>d.value));
                
                console.log(dataGame);
                grid.selectAll("div[class='item']").data(dataGame).enter()
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
                 
                d3.selectAll("div[game='"+g['name']+"']").selectAll('div[class="item"]')
                    .style('opacity', function(){
                        if(d3.select('#hero.grid').text() == ''){ return '0.5';} else {return '1';}
                    });
                if(d3.select('#hero.grid').text() == ''){ 
                    d3.selectAll("div[game='"+g['name']+"']").selectAll('div[class="item"]')
                    .on('mouseover', function(){
                        d3.select(this).style('opacity', '1');
                    })
                    .on('mouseout', function(){
                        d3.select(this).style('opacity', '0.5');
                    });
                }
            };
            function click(d){
                if (d3.select('#hero.grid').text() == ''){  
                    grid1.select("div").append("i")
                    .attr('class', 'fa fa-refresh refresh fa-3x fa-fw')
                    .on('click', refresh);
                    grid1.select("div").append("div")
                    .attr('class', 'item__who'); 

                    d3.select('#hero.grid').select('.item__who')
                    .text(d3.select(this).select('.item__details').text());
                    d3.select('#hero.grid').select('.item__hero')
                    .style('background', d3.select(this).style('background'));
                    d3.selectAll("div[game='"+g['name']+"']").selectAll('div[class="item"]')
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
                          // put all your operations on the second element, e.g.
                          c+=1; 
                        }
                    });
                
                d3.select('span[name="count"]').text(" " + d3.selectAll('.item').size()-c +'/'+ d3.selectAll('.item').size() +"");
            };  
            function refresh(){
                grid1.select('.item__hero').remove();
                generate();
            }; 
        }       
    };
    
  });