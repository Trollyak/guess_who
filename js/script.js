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
    
    function clickGame(g){
        d3.select('span').append('i').attr('class', 'fa fa-arrow-left');
        d3.select('span[name="game"]').text(" (" + g['name']+")");
        d3.select('h1').on('click', function(){
            window.location.reload();
        });
        grid.attr('game', g['name']).attr('person', '');

        const grid1 = d3.select('#hero');
        generate();

        function generate(){
            d3.selectAll('.item').remove();
            grid.style('--auto-grid-min-size', '').style('grid-auto-rows', '250px');
            dataGame = d3.nest().key(d=>d.hero).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['name']==g['name']);
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
                .attr('class', 'item__details')
                .text(d => d['hero']);

            grid1.attr('class', 'grid')
                .style("padding-bottom",'30px')
                .style('--auto-grid-min-size',12)
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
        };  
        function refresh(){
            grid1.select('.item__hero').remove();
            generate();
        };        
    };
    
  });