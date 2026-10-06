import json
import math
import re
from collections import Counter
from html import escape
from pathlib import Path

ROOT = Path(__file__).parent
CHARTS = ROOT / "charts"
CHARTS.mkdir(exist_ok=True)

def svg_open(title, subtitle=""):
    return ["<svg xmlns='http://www.w3.org/2000/svg' width='720' height='440' viewBox='0 0 720 440'>",
            "<rect width='720' height='440' fill='white'/>",
            f"<text x='360' y='30' text-anchor='middle' font-family='Arial,sans-serif' font-size='21' font-weight='bold' fill='#172b4d'>{escape(title)}</text>",
            (f"<text x='360' y='53' text-anchor='middle' font-family='Arial,sans-serif' font-size='13' fill='#52647a'>{escape(subtitle)}</text>" if subtitle else "")]

def svg_close(lines, filename):
    lines.append("</svg>")
    (CHARTS / filename).write_text("\n".join(x for x in lines if x) + "\n")

def axes(lines, xlabel, ylabel, ymax, ticks, x0=82, y0=82, pw=570, ph=280):
    for t in ticks:
        y = y0 + ph - ph * t / ymax
        lines.append(f"<line x1='{x0}' y1='{y:.1f}' x2='{x0+pw}' y2='{y:.1f}' stroke='#dce3eb' stroke-width='1'/>")
        lines.append(f"<text x='{x0-12}' y='{y+5:.1f}' text-anchor='end' font-family='Arial' font-size='12' fill='#34465c'>{t}</text>")
    lines += [f"<line x1='{x0}' y1='{y0}' x2='{x0}' y2='{y0+ph}' stroke='#25364a' stroke-width='1.5'/>",
              f"<line x1='{x0}' y1='{y0+ph}' x2='{x0+pw}' y2='{y0+ph}' stroke='#25364a' stroke-width='1.5'/>",
              f"<text x='{x0+pw/2}' y='414' text-anchor='middle' font-family='Arial' font-size='14' fill='#25364a'>{escape(xlabel)}</text>",
              f"<text x='22' y='{y0+ph/2}' transform='rotate(-90 22 {y0+ph/2})' text-anchor='middle' font-family='Arial' font-size='14' fill='#25364a'>{escape(ylabel)}</text>"]

def bar_chart(filename, title, categories, series, ymax, ylabel, xlabel="Category", grouped=True, subtitle=""):
    lines = svg_open(title, subtitle); x0,y0,pw,ph=82,82,570,280
    ticks=list(range(0, int(ymax)+1, max(1,int(ymax/4))))
    if ticks[-1] != ymax: ticks.append(ymax)
    axes(lines,xlabel,ylabel,ymax,ticks,x0,y0,pw,ph)
    colors=["#3977b8","#e18b3a","#4b9b70","#9564a6"]
    band=pw/len(categories)
    groupw=band*.68
    for j,(name,vals) in enumerate(series):
        width=groupw/len(series) if grouped else groupw
        for i,v in enumerate(vals):
            if grouped:
                bx=x0+i*band+(band-groupw)/2+j*width
            else:
                bx=x0+i*band+(band-width)/2
                if j>0:
                    # Stacked-bar values start at the sum of previous series.
                    vbase=sum(s[1][i] for s in series[:j])
                else: vbase=0
            if grouped: vbase=0
            else: vbase=sum(s[1][i] for s in series[:j])
            bh=ph*v/ymax; by=y0+ph-ph*(vbase+v)/ymax
            lines.append(f"<rect x='{bx:.1f}' y='{by:.1f}' width='{width-2:.1f}' height='{bh:.1f}' fill='{colors[j%len(colors)]}'/>")
            if len(series)==1 or not grouped:
                lines.append(f"<text x='{bx+width/2:.1f}' y='{by-6:.1f}' text-anchor='middle' font-family='Arial' font-size='12' fill='#25364a'>{v:g}</text>")
        if grouped:
            lines.append(f"<rect x='{x0+pw-135}' y='{y0+14+j*21}' width='12' height='12' fill='{colors[j%len(colors)]}'/>")
            lines.append(f"<text x='{x0+pw-116}' y='{y0+25+j*21}' font-family='Arial' font-size='12' fill='#25364a'>{escape(name)}</text>")
    for i,cat in enumerate(categories):
        lines.append(f"<text x='{x0+(i+.5)*band:.1f}' y='{y0+ph+22}' text-anchor='middle' font-family='Arial' font-size='12' fill='#25364a'>{escape(str(cat))}</text>")
    if not grouped and len(series)>1:
        for j,(name,_) in enumerate(series):
            yy=y0+14+j*21
            lines.append(f"<rect x='{x0+pw-145}' y='{yy}' width='12' height='12' fill='{colors[j]}'/><text x='{x0+pw-126}' y='{yy+11}' font-family='Arial' font-size='12' fill='#25364a'>{escape(name)}</text>")
    svg_close(lines,filename)

def histogram(filename,title,bins,counts,subtitle=""):
    lines=svg_open(title,subtitle); ymax=max(counts)+2; x0,y0,pw,ph=82,82,570,280
    ticks=list(range(0,ymax+1,max(1,math.ceil(ymax/4))))
    axes(lines,"Value interval","Frequency",ymax,ticks,x0,y0,pw,ph)
    bw=pw/len(counts)
    for i,(label,v) in enumerate(zip(bins,counts)):
        h=ph*v/ymax; x=x0+i*bw; y=y0+ph-h
        lines.append(f"<rect x='{x:.1f}' y='{y:.1f}' width='{bw:.1f}' height='{h:.1f}' fill='#4b91c8' stroke='white' stroke-width='1'/>")
        lines.append(f"<text x='{x+bw/2:.1f}' y='{y-5:.1f}' text-anchor='middle' font-family='Arial' font-size='11' fill='#25364a'>{v}</text>")
        lines.append(f"<text x='{x+bw/2:.1f}' y='{y0+ph+20}' text-anchor='middle' font-family='Arial' font-size='11' fill='#25364a'>{escape(label)}</text>")
    svg_close(lines,filename)

def scatter(filename,title,points,xlabel,ylabel,xmax,ymax,subtitle=""):
    lines=svg_open(title,subtitle); x0,y0,pw,ph=82,82,570,280
    axes(lines,xlabel,ylabel,ymax,[0,ymax/4,ymax/2,3*ymax/4,ymax],x0,y0,pw,ph)
    for x,y,group in points:
        xx=x0+pw*x/xmax; yy=y0+ph-ph*y/ymax
        color={"A":"#3977b8","B":"#e18b3a","C":"#4b9b70"}.get(group,"#3977b8")
        lines.append(f"<circle cx='{xx:.1f}' cy='{yy:.1f}' r='5.5' fill='{color}' fill-opacity='.82' stroke='white' stroke-width='1'/>")
    svg_close(lines,filename)

def line_chart(filename,title,labels,values,xlabel,ylabel,ymax,subtitle=""):
    lines=svg_open(title,subtitle); x0,y0,pw,ph=82,82,570,280
    ticks=list(range(0,int(ymax)+1,max(1,int(ymax/4))))
    if ticks[-1] != ymax: ticks.append(ymax)
    axes(lines,xlabel,ylabel,ymax,ticks,x0,y0,pw,ph)
    pts=[]
    for i,v in enumerate(values):
        x=x0+(pw*i/(len(values)-1)); y=y0+ph-ph*v/ymax; pts.append((x,y))
        lines.append(f"<text x='{x:.1f}' y='{y0+ph+21}' text-anchor='middle' font-family='Arial' font-size='12' fill='#25364a'>{escape(str(labels[i]))}</text>")
    lines.append("<polyline points='"+" ".join(f"{x:.1f},{y:.1f}" for x,y in pts)+"' fill='none' stroke='#3977b8' stroke-width='3'/>")
    for x,y in pts: lines.append(f"<circle cx='{x:.1f}' cy='{y:.1f}' r='5' fill='#e18b3a' stroke='white' stroke-width='1'/>")
    svg_close(lines,filename)

def pie_chart(filename,title,labels,values,subtitle=""):
    lines=svg_open(title,subtitle); cx,cy,r=360,225,130; colors=["#3977b8","#e18b3a","#4b9b70","#9564a6"]
    total=sum(values); angle=-math.pi/2
    for i,(label,val) in enumerate(zip(labels,values)):
        a2=angle+2*math.pi*val/total
        x1,y1=cx+r*math.cos(angle),cy+r*math.sin(angle); x2,y2=cx+r*math.cos(a2),cy+r*math.sin(a2)
        large=1 if a2-angle>math.pi else 0
        lines.append(f"<path d='M {cx} {cy} L {x1:.2f} {y1:.2f} A {r} {r} 0 {large} 1 {x2:.2f} {y2:.2f} Z' fill='{colors[i]}' stroke='white' stroke-width='2'/>")
        mid=(angle+a2)/2; lx=cx+(r*.64)*math.cos(mid); ly=cy+(r*.64)*math.sin(mid)
        lines.append(f"<text x='{lx:.1f}' y='{ly:.1f}' text-anchor='middle' font-family='Arial' font-size='14' font-weight='bold' fill='white'>{val/total*100:.0f}%</text>")
        angle=a2
    for i,label in enumerate(labels):
        yy=115+i*28; lines.append(f"<rect x='555' y='{yy}' width='14' height='14' fill='{colors[i]}'/><text x='577' y='{yy+12}' font-family='Arial' font-size='12' fill='#25364a'>{escape(label)}</text>")
    lines.append("<text x='360' y='400' text-anchor='middle' font-family='Arial' font-size='13' fill='#25364a'>Share of all responses</text>")
    svg_close(lines,filename)

def boxplot(filename,title,categories,boxes,ymax,ylabel,subtitle=""):
    lines=svg_open(title,subtitle); x0,y0,pw,ph=100,82,550,280
    ticks=list(range(0,int(ymax)+1,max(1,int(ymax/4))))
    if ticks[-1] != ymax: ticks.append(ymax)
    axes(lines,"Group",ylabel,ymax,ticks,x0,y0,pw,ph)
    for i,(cat,(lo,q1,med,q3,hi)) in enumerate(zip(categories,boxes)):
        x=x0+pw*(i+.5)/len(categories); bw=82
        Y=lambda v:y0+ph-ph*v/ymax
        lines.append(f"<line x1='{x}' y1='{Y(lo):.1f}' x2='{x}' y2='{Y(hi):.1f}' stroke='#25364a' stroke-width='2'/>")
        lines.append(f"<line x1='{x-25}' y1='{Y(lo):.1f}' x2='{x+25}' y2='{Y(lo):.1f}' stroke='#25364a' stroke-width='2'/>")
        lines.append(f"<line x1='{x-25}' y1='{Y(hi):.1f}' x2='{x+25}' y2='{Y(hi):.1f}' stroke='#25364a' stroke-width='2'/>")
        lines.append(f"<rect x='{x-bw/2}' y='{Y(q3):.1f}' width='{bw}' height='{Y(q1)-Y(q3):.1f}' fill='#86b7d8' stroke='#25364a' stroke-width='2'/>")
        lines.append(f"<line x1='{x-bw/2}' y1='{Y(med):.1f}' x2='{x+bw/2}' y2='{Y(med):.1f}' stroke='#d45b4b' stroke-width='4'/>")
        lines.append(f"<text x='{x}' y='{y0+ph+22}' text-anchor='middle' font-family='Arial' font-size='13' fill='#25364a'>{escape(cat)}</text>")
    svg_close(lines,filename)

# The finished stimuli are actual plots from the libraries in this lesson,
# exported as SVG for sharp rendering in the HTML question preview.
import os
os.environ.setdefault("MPLCONFIGDIR", "/tmp/thanaweya-matplotlib-config")
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

plt.rcParams["svg.fonttype"] = "none"
PALETTE = ["#3977b8", "#e18b3a", "#4b9b70", "#9564a6"]
sns.set_theme(style="whitegrid", palette=PALETTE)

def _finish_plot(fig, filename, subtitle=""):
    if subtitle:
        fig.text(.5, .955, subtitle, ha="center", va="top", fontsize=9, color="#52647a")
        fig.tight_layout(rect=(0, 0, 1, .93))
    else:
        fig.tight_layout()
    fig.savefig(CHARTS / filename, format="svg", bbox_inches="tight")
    plt.close(fig)

def bar_chart(filename,title,categories,series,ymax,ylabel,xlabel="Category",grouped=True,subtitle=""):
    frame=pd.DataFrame({name:values for name,values in series},index=categories)
    fig,ax=plt.subplots(figsize=(9,5.2))
    if filename == "city_enrolment_horizontal.svg":
        frame.iloc[:,0].plot.barh(ax=ax,color=PALETTE[0],edgecolor="white")
        ax.set_xlabel(ylabel); ax.set_ylabel(xlabel)
        ax.set_xlim(0,ymax)
    else:
        frame.plot.bar(ax=ax,stacked=(not grouped and len(series)>1),color=PALETTE[:len(series)],edgecolor="white",rot=0)
        ax.set_xlabel(xlabel); ax.set_ylabel(ylabel); ax.set_ylim(0,ymax)
        if len(series)>1: ax.legend(title=None,frameon=False)
    ax.set_title(title,pad=14)
    _finish_plot(fig,filename,subtitle)

def histogram(filename,title,bins,counts,subtitle=""):
    width=10 if filename=="ages_histogram.svg" else 20
    starts=[int(label.split("–")[0].rstrip("+")) for label in bins]
    values=[]
    for start,count in zip(starts,counts):
        values.extend([start+width*.43 + (j%5)*width*.025 for j in range(count)])
    edges=starts+[starts[-1]+width]
    fig,ax=plt.subplots(figsize=(9,5.2))
    pd.Series(values,name="value").plot.hist(ax=ax,bins=edges,color=PALETTE[0],edgecolor="white")
    ax.set_xticks([s+width*.5 for s in starts],bins)
    ax.set_xlabel("Age (years)" if width==10 else "Annual income (thousands)")
    ax.set_ylabel("Frequency"); ax.set_title(title,pad=14)
    _finish_plot(fig,filename,subtitle)

def scatter(filename,title,points,xlabel,ylabel,xmax,ymax,subtitle=""):
    frame=pd.DataFrame(points,columns=[xlabel,ylabel,"group"])
    fig,ax=plt.subplots(figsize=(9,5.2))
    if frame["group"].nunique()>1:
        sns.scatterplot(data=frame,x=xlabel,y=ylabel,hue="group",palette={"A":PALETTE[0],"B":PALETTE[1],"C":PALETTE[2]},s=75,ax=ax)
        ax.legend(title="Group",frameon=False)
    else:
        frame.plot.scatter(x=xlabel,y=ylabel,ax=ax,color=PALETTE[0],s=65,alpha=.85)
    ax.set_xlim(left=0,right=xmax); ax.set_ylim(bottom=0,top=ymax)
    ax.set_title(title,pad=14)
    _finish_plot(fig,filename,subtitle)

def line_chart(filename,title,labels,values,xlabel,ylabel,ymax,subtitle=""):
    frame=pd.DataFrame({xlabel:labels,ylabel:values})
    fig,ax=plt.subplots(figsize=(9,5.2))
    frame.plot.line(x=xlabel,y=ylabel,marker="o",ax=ax,color=PALETTE[0],legend=False)
    ax.set_ylim(bottom=0,top=ymax); ax.set_title(title,pad=14)
    _finish_plot(fig,filename,subtitle)

def pie_chart(filename,title,labels,values,subtitle=""):
    fig,ax=plt.subplots(figsize=(8.5,5.2))
    pd.Series(values,index=labels).plot.pie(ax=ax,autopct="%1.0f%%",startangle=90,colors=PALETTE[:len(values)],wedgeprops={"edgecolor":"white","linewidth":2})
    ax.set_ylabel(""); ax.set_title(title,pad=14)
    _finish_plot(fig,filename,subtitle)

def boxplot(filename,title,categories,boxes,ymax,ylabel,subtitle=""):
    # Eight values per group reproduce the quartiles and medians shown in the prompt.
    sample={cat:[lo,q1,q1,med,med,q3,q3,hi] for cat,(lo,q1,med,q3,hi) in zip(categories,boxes)}
    frame=pd.DataFrame(sample)
    fig,ax=plt.subplots(figsize=(9,5.2))
    sns.boxplot(data=frame,ax=ax,color="#86b7d8",showfliers=False,width=.55)
    ax.set_ylim(0,ymax); ax.set_xlabel("Outcome"); ax.set_ylabel(ylabel); ax.set_title(title,pad=14)
    _finish_plot(fig,filename,subtitle)

# Separate figures, varied across the seven chart types taught in this lesson.
bar_chart("student_scores_grouped_bar.svg","Exam scores by student",["A","B","C","D"],[("Math",[10,20,30,40]),("Economics",[5,15,25,35])],45,"Score","Student",True,"Illustrative class results")
histogram("ages_histogram.svg","Age distribution",["0–9","10–19","20–29","30–39","40–49","50–59"],[3,9,16,12,7,3],"Illustrative sample; bars represent adjacent intervals")
histogram("income_histogram.svg","Annual income distribution",["0–19","20–39","40–59","60–79","80–99","100+"],[14,18,11,6,3,2],"Illustrative values in thousands")
bar_chart("passenger_class_counts_unsorted.svg","Passengers by class",["3","1","2"],[("Passengers",[491,216,184])],550,"Count","Class",False,"Categories are in frequency order")
bar_chart("country_category_bar.svg","Counts by country",["France","Egypt","Japan"],[("Records",[34,52,28])],60,"Count","Country",False,"Illustrative, unordered categories")
bar_chart("city_enrolment_horizontal.svg","Enrolment by city",["Cairo","Giza","Aswan"],[("Students",[420,260,180])],500,"Students","City",False,"Illustrative counts")
boxplot("fare_by_outcome_boxplot.svg","Fare distributions by outcome",["Not survived","Survived"],[(4,8,11,26,80),(6,10,27,52,92)],100,"Fare (units)","Illustrative distributions overlap")
line_chart("egypt_population_line.svg","Egypt population over time",[1960,1970,1980,1990,2000,2010,2020],[27,35,43,55,66,82,102],"Year","Population (millions)",120,"Illustrative decennial series")
scatter("study_hours_score_scatter.svg","Study hours and exam score",[(1,48,"A"),(2,51,"A"),(2,58,"A"),(3,56,"A"),(4,65,"A"),(4,68,"A"),(5,72,"A"),(6,75,"A"),(7,81,"A"),(8,86,"A"),(9,88,"A")],"Study hours","Score",10,100,"Illustrative observations; positive association")
scatter("age_fare_scatter.svg","Passenger age and fare",[(16,9,"A"),(22,11,"A"),(28,8,"A"),(35,14,"A"),(41,10,"A"),(48,16,"A"),(54,12,"A"),(62,13,"A"),(29,48,"A"),(37,82,"A"),(44,125,"A"),(19,26,"A"),(67,21,"A"),(52,56,"A")],"Age (years)","Fare",75,150,"Illustrative passenger-like data; no clear age trend")
scatter("two_groups_scatter.svg","Hours studied and quiz score by group",[(1,30,"A"),(2,40,"A"),(3,38,"A"),(4,48,"A"),(5,51,"A"),(6,62,"A"),(2,60,"B"),(3,67,"B"),(4,70,"B"),(5,78,"B"),(6,82,"B"),(7,90,"B")],"Study hours","Quiz score",8,100,"Illustrative observations")
pie_chart("survey_composition_pie.svg","How respondents used the service",["Weekly","Monthly","Rarely"],[52,31,17],"Illustrative survey; categories form one whole")
pie_chart("similar_shares_pie.svg","Three similar category shares",["A","B","C"],[30,33,37],"Similar slice sizes are difficult to compare precisely")
bar_chart("survival_by_class_stacked.svg","Outcome shares by class",["Class 1","Class 2","Class 3"],[("Survived",[80,60,30]),("Did not survive",[20,40,70])],100,"Share (%)","Passenger class",False,"Illustrative percentages; each bar totals 100%")

# question, answer, distractors, explanation, PDF page, objective, operation, asset, alt text, code
raw = [
 ("Which library is described as the plotting foundation that offers detailed control but can require more code?","Matplotlib",["Seaborn","Plotly","Bokeh"],"The lesson describes Matplotlib as the foundation with extensive control, while noting its more verbose interface.",56,"plotting library roles","identify the plotting foundation",None,None,None),
 ("Which library is built on Matplotlib and provides statistical plots with attractive defaults?","Seaborn",["Bokeh","NumPy","Plotly"],"Seaborn is presented as built on Matplotlib and designed for statistical visualization with convenient defaults.",56,"plotting library roles","identify a library relationship",None,None,None),
 ("A dashboard should let users zoom, pan, and hover over data points. Which library pair best fits the lesson's description?","Plotly or Bokeh",["Matplotlib or NumPy","pandas or Seaborn","SciPy or scikit-learn"],"The lesson identifies Plotly and Bokeh as interactive web-chart builders with zoom, pan, and hover.",56,"plotting library roles","choose an interactive plotting tool",None,None,None),
 ("What is the role of pandas `.plot()` in this lesson?","A convenient way to make quick exploratory charts from pandas data",["A replacement for storing data in a DataFrame","A machine-learning method for predicting categories","An interactive dashboard framework with built-in hover controls"],"Pandas plotting is taught as a limited, convenient layer over Matplotlib for quick exploratory data analysis.",56,"pandas plotting purpose","explain the plotting interface",None,None,None),
 ("A researcher wants to see how one numerical variable is distributed across its range. Which chart matches that question?","Histogram",["Pie chart","Stacked bar chart","Line chart across categories"],"A histogram groups one numerical variable into intervals and shows how values are distributed.",58,"choose a chart by purpose","select a distribution chart",None,None,None),
 ("In the age histogram, which interval has the largest frequency?","20–29",["0–9","10–19","50–59"],"The tallest bar is the 20–29 interval, with the highest displayed count.",None,"read a histogram","identify the modal bin","charts/ages_histogram.svg","Histogram of illustrative ages; bins 0–9 through 50–59 have frequencies 3, 9, 16, 12, 7, and 3.",None),
 ("In the income histogram, how many observations fall in the 60–79 interval?","6",["3","11","18"],"The bar labeled 60–79 reaches a frequency of 6.",None,"read a histogram","read a bin frequency","charts/income_histogram.svg","Histogram of annual income in thousands; the 60–79 bin has frequency 6.",None),
 ("Why might an analyst try several values for `bins` when exploring the same numerical data?","Different bin counts can reveal or obscure distributional structure even though the observations stay the same",["Changing bins changes the original values in the DataFrame","More bins always prove a causal relationship","The number of bins determines the sample size"],"The lesson warns that a coarse or very fine binning can change the apparent shape without changing the underlying data.",None,"histogram binning","explain the effect of bin choice",None,None,"values.plot.hist(bins=20)"),
 ("Which variable type and purpose best match a pie chart?","One categorical variable, showing parts of a whole",["One numerical variable, showing its distribution","Two numerical variables, showing their relationship","A numerical value across time, showing a trend"],"The lesson pairs pie charts with one categorical variable and composition of a whole.",58,"choose a chart by purpose","match pie chart to data",None,None,None),
 ("The survey pie has shares of 52%, 31%, and 17%. What is the strongest reason the pie is interpretable here?","It shows a small number of categories that make up one whole",["Pie charts are best for comparing exact values across many categories","It places a numerical distribution into bins","Its slices show a trend between successive months"],"A pie is most defensible with few categories when the message is part-to-whole composition.",None,"read a pie chart","interpret composition", "charts/survey_composition_pie.svg","Pie chart of service-use categories: weekly 52%, monthly 31%, rarely 17%.",None),
 ("Why can a pie chart be a poor choice when category shares are 30%, 33%, and 37%?","Similar angles are hard to compare precisely; a bar chart makes the differences clearer",["A pie chart cannot represent categorical data","Pie charts convert categories into time series","The percentages cannot sum to a whole"],"The lesson cautions that people judge similar slice angles poorly and recommends bars for clearer comparisons.",58,"critique chart choices","evaluate pie-chart limitations","charts/similar_shares_pie.svg","Pie chart with three similar shares: A 30%, B 33%, and C 37%.",None),
 ("In the pie chart with shares of 30%, 33%, and 37%, which category has the largest share?","C",["A","B","They are equal"],"Category C has the largest share at 37%, although the similar slice sizes make precise visual comparison difficult.",None,"read and critique a pie chart","compare similar proportions","charts/similar_shares_pie.svg","Pie chart with three similar shares: A 30%, B 33%, and C 37%.",None),
 ("A manager wants to compare enrollment counts across Cairo, Giza, and Aswan. Which plot is most suitable?","Bar chart",["Histogram","Pie chart of the city names","Line chart connecting the cities"],"A bar chart compares numerical values across categories, which matches counts by city.",58,"choose a chart by purpose","select a categorical comparison",None,None,None),
 ("In a 100%-stacked bar chart, what can a reader compare?","The composition of each group's 100% total, including the shares of its categories",["The absolute sample sizes of groups with different totals","Only the distribution of one numerical variable","The exact ordering of individual observations"],"A 100%-stacked bar compares within-group composition; normalization means it does not show absolute group totals.",58,"interpret stacked bars","explain comparison and composition",None,None,None),
 ("Which question is especially well suited to a box plot?","How do the median, quartiles, and spread of fares compare across survival groups?",["How many records fall in each five-year age interval?","What share of one total belongs to each category?","How do two numerical variables relate point by point?"],"A box plot compares distributions across categories using median, quartiles, and range.",58,"choose a chart by purpose","select a distribution comparison",None,None,None),
 ("On the fare box plot, which outcome group has the higher median fare?","Survived",["Not survived","They have the same median","The plot does not mark medians"],"The median line for the survived group is higher on the fare axis.",None,"read a box plot","compare medians","charts/fare_by_outcome_boxplot.svg","Two fare box plots; the survived group's median is above the not-survived group's, and their distributions overlap.",None),
 ("What important feature does the fare box plot show beyond a difference in medians?","The two fare distributions overlap substantially",["Every survivor paid more than every non-survivor","The two groups have identical distributions","Fare is a categorical variable"],"The boxes and whiskers overlap, so a higher group median does not imply that every person in that group has a higher fare.",None,"read a box plot","interpret distribution overlap","charts/fare_by_outcome_boxplot.svg","Two fare box plots with overlapping boxes and whiskers; survived median is higher.",None),
 ("A dataset records Egypt's population at ten-year intervals from 1960 to 2020. Which chart fits the ordered time series?","Line chart",["Pie chart","Unordered bar chart only","Histogram"],"A line chart communicates trends in time-ordered numerical values.",58,"choose a chart by purpose","select a time-series chart",None,None,None),
 ("Why would joining bars for France, Egypt, and Japan with a line suggest something misleading?","It implies meaningful intermediate values between unordered country categories",["A line chart can show only categorical data","The country names cannot appear on a horizontal axis","A line chart always converts values to percentages"],"Lines imply continuity; separate countries have no natural between-categories path.",None,"interpret line-chart implications","identify a misleading connection","charts/country_category_bar.svg","Bar chart comparing three unordered countries; categories are France, Egypt, and Japan.",None),
 ("A scatter plot is designed to show what kind of relationship?","The relationship between two numerical variables",["The composition of one categorical total","The frequency of intervals in one numerical variable","The distribution of one category across subgroups only"],"Scatter plots place paired numerical observations against one another to show relationships.",58,"choose a chart by purpose","select a relationship chart",None,None,None),
 ("What pattern is visible in the study-hours scatter plot?","Scores generally increase as study hours increase, with some variation",["Scores are constant for all study-hour values","Scores generally decrease as study hours increase","The plot shows only category proportions"],"The points show a broadly positive association, though they do not all lie on a single exact line.",None,"read a scatter plot","describe an association","charts/study_hours_score_scatter.svg","Scatter plot showing a generally positive association between study hours and quiz score, with points not perfectly aligned.",None),
 ("Which conclusion is justified by a positive pattern in a scatter plot of study hours and score?","The variables are positively associated in these observations",["Studying is proven to cause every score increase","Every additional hour guarantees the same score gain","The variables are identical"],"A scatter plot can show association, but the pattern alone does not prove causation or a guaranteed effect.",None,"interpret a scatter plot cautiously","avoid causal overclaim","charts/study_hours_score_scatter.svg","Scatter plot with a positive association between study hours and scores.",None),
 ("Which chart is shown in the student-score figure, and what is being compared?","Grouped bars compare Math and Economics scores across students",["A stacked bar compares each student's score composition", "A histogram compares one score distribution", "A line chart shows scores over time"],"Each student is a category, and two separate numerical series are compared side by side.",None,"read a grouped bar chart","identify chart structure","charts/student_scores_grouped_bar.svg","Grouped bar chart comparing Math and Economics scores for students A to D.",None),
 ("In the city enrollment horizontal bar chart, which city has the lowest displayed enrollment?","Aswan",["Cairo","Giza","All three are equal"],"Aswan's bar is shortest, so it represents the smallest enrollment among the three cities.",None,"read a bar chart","compare category values","charts/city_enrolment_horizontal.svg","Horizontal bar chart of student enrollment: Cairo 420, Giza 260, Aswan 180.",None),
 ("The class-count chart lists classes in the order 3, 1, 2. What explains this order?","The categories are arranged by frequency, from largest count to smallest",["The classes are arranged by their natural numeric order","A line chart reordered the categories by time","The counts were normalized to percentages"],"Value counts sort by frequency by default; class 3 has the greatest count in this figure.",None,"order bar-chart categories","interpret frequency ordering","charts/passenger_class_counts_unsorted.svg","Bar chart of passenger counts with categories ordered by frequency: class 3, class 1, class 2.",None),
 ("If passenger class has a meaningful order 1, 2, 3, which step makes the bar chart follow that order rather than frequency?","Apply `.sort_index()` to the value_counts result before plotting",["Apply `.sort_values(ascending=False)`", "Use `.sample()` before plotting", "Convert the class labels to a pie chart"],"`value_counts()` sorts by frequency; `.sort_index()` sorts by the class labels so the natural order is shown.",None,"order categories for a chart","choose a sorting operation",None,None,"class_count = df['pclass'].value_counts().sort_index()\nclass_count.plot.bar()"),
 ("Which chart in the set is designed to show a single numerical distribution rather than category comparisons?","The age histogram",["The student grouped bar chart","The city enrollment bar chart","The outcome stacked bar chart"],"The histogram bins one numerical variable; the bar charts compare values across categories.",None,"distinguish chart purposes","classify a chart by variables","charts/ages_histogram.svg","Histogram showing frequencies across numerical age intervals.",None),
 ("In the Egypt population line chart, what does the rising sequence indicate?","Population increased across the observed years",["Population fell steadily from 1960 to 2020","The points represent unordered countries","The chart gives the share of a whole"],"The plotted values rise over the ordered years, showing an upward time trend.",None,"read a line chart","interpret a time trend","charts/egypt_population_line.svg","Line chart of Egypt's illustrative population from 27 million in 1960 to 102 million in 2020.",None),
 ("In the 100%-stacked outcome chart, which class has the largest 'Survived' share?","Class 1",["Class 2","Class 3","All are equal"],"Class 1's survived segment reaches 80%, higher than class 2 at 60% and class 3 at 30%.",None,"read a stacked bar chart","compare within-group shares","charts/survival_by_class_stacked.svg","100% stacked bars; survived shares are 80%, 60%, and 30% for classes 1, 2, and 3.",None),
 ("A researcher wants to examine whether age and fare vary together for individual passengers. Which chart is the best first view?","Scatter plot",["Pie chart","Histogram of age only","Stacked bar chart of fare intervals"],"Both age and fare are numerical, and a scatter plot shows paired numerical observations.",58,"select a chart for two numerical variables","choose a scatter plot",None,None,None),
 ("The age–fare scatter has a few very high fares at different ages and no obvious upward pattern. What is the best reading?","The plot shows no clear age trend, and fares vary widely at several ages",["Every older passenger paid more","Age determines fare exactly","The highest fare must belong to the oldest passenger"],"The points do not form a consistent increasing age–fare pattern; high fares appear at more than one age.",None,"read a scatter plot","interpret a weak relationship","charts/age_fare_scatter.svg","Scatter plot of passenger-like ages and fares with several high fares at different ages and no clear linear trend.",None),
 ("Which call creates a histogram of the `age` column with 20 bins in the lesson's style?","`df['age'].plot.hist(bins=20)`",["`df['age'].plot.bar(bins=20)`","`df.plot.line(x='age', bins=20)`","`df['age'].plot.pie(bins=20)`"],"The lesson calls the Series' `plot.hist` method and supplies the bin count.",None,"write pandas plotting code","construct a histogram call",None,None,"df['age'].plot.hist(bins=20)"),
 ("A researcher wants to show how each group's outcomes contribute to that group's total and compare those compositions across groups. Which plot best fits?","Stacked bar chart",["Histogram","Scatter plot","Single-series line chart"],"Stacked bars show group totals divided into component categories, supporting comparison and composition.",58,"choose a chart by purpose","select a composition comparison",None,None,None),
 ("Why might the box plot reveal a more complete group comparison than reporting only the two means?","It also shows medians, quartiles, spread, and overlap between distributions",["It removes the need to know which variable is numerical","It proves that every observation equals the median","It shows exact causal effects"],"A box plot communicates distributional spread and overlap that a pair of means alone hides.",None,"compare distributions","explain box-plot value","charts/fare_by_outcome_boxplot.svg","Overlapping box plots of fare by outcome; the medians differ but ranges overlap.",None),
 ("The service-use categories form mutually exclusive parts of one response total. Which chart could show their composition, with the lesson's readability caveat?","Pie chart, if the number of categories is small",["Scatter plot, because categories are paired observations","Histogram, because categories are numerical intervals","Line chart, because categories imply continuity"],"The lesson allows a pie for a small number of parts making a whole, while cautioning that similar shares are hard to compare.",58,"choose and critique a composition chart","apply pie-chart conditions",None,None,None),
 ("Which plotting call compares Math and Economics by Student using the DataFrame shown in the lesson?","`df.plot.bar(x='Student')`",["`df.plot.hist(x='Student')`","`df.plot.pie(x='Student')`","`df.plot.scatter(x='Student')`"],"The lesson's example uses a bar plot with Student categories on the x-axis and numeric subject scores as series.",59,"write pandas plotting code","choose a bar-plot call",None,None,"df.plot.bar(x='Student')"),
 ("In the two-group scatter plot, which group generally has the higher quiz score at study-hour values shared by both groups?","Group B",["Group A","The scores are identical at all shared values","The plot cannot distinguish groups"],"At the overlapping study-hour values, the orange Group B points are generally above the blue Group A points.",None,"read a grouped scatter plot","compare patterns across groups","charts/two_groups_scatter.svg","Scatter plot with two colored groups; Group B's scores are generally higher where study-hour values overlap.",None),
 ("The lesson says pandas plotting is intentionally limited. What use is it best suited for?","Quick exploratory analysis while examining data",["Creating every kind of publication-ready graphic with no customization", "Training machine-learning models", "Serving interactive dashboards with hover controls"],"The lesson presents pandas.plot as a convenient first-look interface, while more specialized tools offer other capabilities.",56,"choose a plotting approach","identify exploratory plotting use",None,None,None),
 ("A bar chart shows unordered regions with counts. Why are bars preferable to connecting the region values with a line?","Bars compare categories without suggesting values between categories",["Bars turn counts into proportions automatically", "Lines are restricted to categorical values", "Regions cannot be displayed on a horizontal axis"],"Bars make category comparisons without implying continuity between unrelated regions.",None,"select chart for unordered categories","avoid false continuity","charts/country_category_bar.svg","Bar chart comparing illustrative counts across unordered regions France, Egypt, and Japan.",None),
 ("Which chart-selection rule best follows the lesson?","Choose the chart based on whether the question concerns distribution, composition, comparison, or relationship",["Use a pie chart whenever the dataset has several columns", "Use a line chart for every comparison", "Choose the chart with the most colors, regardless of the variables"],"The lesson's organizing principle is to match the chart type to the analytical question and variable types.",58,"select charts by analytical purpose","apply the chart-selection rule",None,None,None),
]

essays = [
 {"prompt":"A student dataset has one numerical score for each learner and each learner belongs to one class. Recommend a chart for comparing score distributions across classes, explain what the reader can learn from it, and state one limitation of comparing only class means.",
  "expectedAnswer":"A box plot is appropriate because it compares a numerical distribution across categorical classes. It shows medians, quartiles, and spread, allowing the reader to see differences and overlap. Means alone hide distribution shape and overlap; a higher mean does not mean every student in that class scored higher. A box plot also does not show every individual score or establish why groups differ.",
  "justification":"The prompt applies the lesson's box-plot purpose and its warning that group means can conceal substantial overlap.",
  "rubric":[{"criterion":"Selects a box plot", "points":1},{"criterion":"Identifies class as categorical and score as numerical", "points":1},{"criterion":"Explains median/quartiles/spread", "points":1},{"criterion":"Explains overlap or why means alone can mislead", "points":1},{"criterion":"Avoids causal or universal claims", "points":1}],
  "source":"4_visualization.md — Box plot; PDF p. 58", "operation":"choose and interpret a distribution comparison", "stimulusAsset":"charts/fare_by_outcome_boxplot.svg", "stimulusAssetAlt":"Two overlapping box plots show different medians but substantial overlap in group distributions."},
 {"prompt":"Use the grouped student-score chart. Describe the main comparisons it supports, identify one fact that can be read for a named student, and explain why a grouped bar chart fits better than a histogram for this dataset.",
  "expectedAnswer":"The grouped bars compare Math and Economics scores across the student categories. For example, student C has Math 30 and Economics 25; Math is higher for each displayed student. A grouped bar chart fits because Student is categorical and there are two numerical score series to compare across categories. A histogram would instead show the distribution of one numerical variable and would not preserve the student-by-student comparisons.",
  "justification":"The figure is the lesson's grouped categorical comparison pattern; the answer contrasts it with a histogram's numerical-distribution purpose.",
  "rubric":[{"criterion":"Describes the subject comparison across students", "points":1},{"criterion":"Reads at least one displayed pair correctly", "points":1},{"criterion":"Identifies student as categorical and scores as numerical", "points":1},{"criterion":"Explains why grouped bars fit the task", "points":1},{"criterion":"Contrasts with a histogram accurately", "points":1}],
  "source":"4_visualization.md — Bar chart; PDF p. 59", "operation":"read and justify a grouped bar chart", "stimulusAsset":"charts/student_scores_grouped_bar.svg", "stimulusAssetAlt":"Grouped bars compare Math and Economics scores for students A, B, C, and D."},
 {"prompt":"Compare the age histogram and the income histogram. Identify the tallest bin in each, explain what binning does, and describe how changing the number of bins can affect the apparent story without changing the records.",
  "expectedAnswer":"The tallest age bin is 20–29; the tallest income bin is 20–39. A histogram groups a numerical variable into intervals and counts observations in each interval. Fewer bins can smooth away structure; many bins can make random variation look prominent. The underlying observations stay fixed even though the visual shape changes, so analysts should compare sensible bin choices.",
  "justification":"The response interprets two actual histogram stimuli and applies the lesson's explanation of bin counts and apparent distribution shape.",
  "rubric":[{"criterion":"Names the modal age interval correctly", "points":1},{"criterion":"Names the modal income interval correctly", "points":1},{"criterion":"Explains intervals and frequencies", "points":1},{"criterion":"Explains how bin count changes visual shape", "points":1},{"criterion":"States the underlying observations do not change", "points":1}],
  "source":"4_visualization.md — Histogram; PDF p. 58", "operation":"read histograms and explain binning", "stimulusAssets":["charts/ages_histogram.svg","charts/income_histogram.svg"], "stimulusAssetsAlt":["Age histogram with its highest frequency in the 20–29 interval.","Income histogram with its highest frequency in the 20–39 interval."]},
 {"prompt":"Examine the study-hours and score scatter plot. Describe its pattern and give a careful conclusion. Explain why the plot alone cannot establish that extra study time caused the scores to rise, and name one additional kind of evidence or design that would help investigate causation.",
  "expectedAnswer":"The plot shows a generally positive association: higher study-hour values tend to occur with higher scores, though points vary. This is an association, not proof that study time caused the scores. Prior achievement, instruction, or other factors may affect both; a randomized study assigning study time or a carefully designed analysis accounting for plausible confounders would provide stronger causal evidence.",
  "justification":"The answer reads the provided scatter plot as a relationship between two numerical variables and avoids turning visual association into a causal claim.",
  "rubric":[{"criterion":"Describes the positive but imperfect pattern", "points":1},{"criterion":"Identifies the two variables as numerical", "points":1},{"criterion":"States the chart alone does not establish causation", "points":1},{"criterion":"Names a plausible confounder or alternative explanation", "points":1},{"criterion":"Suggests a reasonable design or evidence for causal investigation", "points":1}],
  "source":"4_visualization.md — Scatter plot; Module 3 Lesson 3 correlation cautions", "operation":"interpret a relationship plot cautiously", "stimulusAsset":"charts/study_hours_score_scatter.svg", "stimulusAssetAlt":"Scatter plot with a generally positive association between study hours and score."},
 {"prompt":"A report compares survival outcomes across passenger classes and also wants readers to see how the total outcome composition differs by class. Use the 100%-stacked chart to state the surviving share in each class and justify why a stacked bar is suitable. What important information would the chart not show?",
  "expectedAnswer":"The chart shows survived shares of 80% for class 1, 60% for class 2, and 30% for class 3. A 100%-stacked bar compares categorical groups and shows the composition of each group's outcome total. It does not show the absolute number of passengers in each class because every bar is normalized to 100%; the values are illustrative rather than historical findings.",
  "justification":"The prompt uses an actual stacked bar stimulus to assess both within-group proportions and the limits introduced by normalization.",
  "rubric":[{"criterion":"Reads class 1 share correctly", "points":1},{"criterion":"Reads class 2 and class 3 shares correctly", "points":1},{"criterion":"Explains comparison and composition roles", "points":1},{"criterion":"Notes that normalized bars hide group totals", "points":1},{"criterion":"Recognizes the values are illustrative", "points":1}],
  "source":"4_visualization.md — Stacked bar; PDF p. 58", "operation":"read and critique a normalized stacked chart", "stimulusAsset":"charts/survival_by_class_stacked.svg", "stimulusAssetAlt":"100%-stacked bars show survived shares of 80%, 60%, and 30% for classes 1, 2, and 3."},
 {"prompt":"A colleague uses a line chart to connect counts for France, Egypt, and Japan. Use the country comparison chart to explain why the line creates a misleading implication, then recommend a better chart and explain the difference in meaning.",
  "expectedAnswer":"The countries are unordered categories, so connecting them implies meaningful intermediate values or continuity between France, Egypt, and Japan where none exists. A bar chart is better for comparing numerical counts across those categories; separated bars compare categories without suggesting a path between them.",
  "justification":"The response applies the lesson's explicit warning that line segments imply continuity and uses the supplied category chart as a contrast.",
  "rubric":[{"criterion":"Identifies the categories as unordered", "points":1},{"criterion":"Explains the false continuity/intermediate-value implication", "points":1},{"criterion":"Recommends a bar chart", "points":1},{"criterion":"Explains category comparison as the bar chart's purpose", "points":1},{"criterion":"Avoids interpreting category order as a time trend", "points":1}],
  "source":"4_visualization.md — Bar chart and line chart; PDF p. 58", "operation":"critique a chart choice and select a replacement", "stimulusAsset":"charts/country_category_bar.svg", "stimulusAssetAlt":"Bar chart comparing counts in three unordered categories: France, Egypt, and Japan."},
 {"prompt":"A categorical survey asks whether respondents use a service weekly, monthly, or rarely. Recommend a chart for showing shares, explain when a pie is reasonable, and describe when a sorted bar chart would communicate the differences more clearly.",
  "expectedAnswer":"A pie chart can show the categories as parts of one whole because there are only three mutually exclusive response categories. It is most suitable when composition is the message. If precise comparison of similar shares is important, a bar chart sorted in a meaningful order is clearer because lengths are easier to compare than angles.",
  "justification":"The response draws on the lesson's qualified endorsement of pie charts and its caution about comparing similar angles.",
  "rubric":[{"criterion":"Recommends a pie for the stated small part-to-whole task", "points":1},{"criterion":"Explains the part-to-whole condition", "points":1},{"criterion":"Recognizes the small number of categories", "points":1},{"criterion":"Recommends bars for precise comparison", "points":1},{"criterion":"Explains why bar lengths help compare similar values", "points":1}],
  "source":"4_visualization.md — Pie chart; PDF p. 58", "operation":"choose and qualify a composition chart", "stimulusAsset":"charts/survey_composition_pie.svg", "stimulusAssetAlt":"Pie chart with service use shares of weekly 52%, monthly 31%, rarely 17%."},
 {"prompt":"Write pandas plotting code for two tasks: (1) make a 20-bin histogram of a numerical `age` column; (2) make a scatter plot of numerical `age` against numerical `fare`. Explain what question each chart helps answer and state one limitation of using pandas `.plot()`.",
  "expectedAnswer":"For example: `df['age'].plot.hist(bins=20, title='Age distribution')` and `df.plot.scatter(x='age', y='fare', title='Age and fare')`. The histogram shows how one numerical variable is distributed; the scatter plot shows the relationship between two numerical variables. Pandas plotting is a convenient but limited layer for quick exploratory work; more detailed or interactive graphics may need other tools.",
  "justification":"The answer uses the two chart calls shown in the lesson and links each to the chart-selection table's purpose.",
  "rubric":[{"criterion":"Writes a valid histogram call with 20 bins", "points":1},{"criterion":"Writes a valid scatter call with age and fare axes", "points":1},{"criterion":"Explains the histogram's distribution purpose", "points":1},{"criterion":"Explains the scatter plot's relationship purpose", "points":1},{"criterion":"States a limitation or exploratory-use boundary for pandas plotting", "points":1}],
  "source":"4_visualization.md — Histogram, scatter plot, and pandas.plot(); PDF pp. 56–58", "operation":"write plotting calls and explain their use", "stimulusCode":"df['age'].plot.hist(bins=20)\ndf.plot.scatter(x='age', y='fare')"},
]

if len(raw) != 40 or len(essays) != 8:
    raise ValueError(f"Expected 40 MCQs and 8 essays; got {len(raw)} and {len(essays)}")
positions=[0,1,2,3]*10
mcqs=[]
for i,(q,answer,distractors,explanation,page,objective,operation,asset,alt,code) in enumerate(raw,1):
    options=list(distractors); options.insert(positions[i-1],answer)
    source=f"4_visualization.md — {objective}" + (f"; Module 3 Lecture 3_1 PDF p. {page}" if page else "")
    item={"id":f"M3L4-{i:03d}","question":q,"options":options,"correctIndex":positions[i-1],"expectedAnswer":answer,"explanation":explanation,"source":source,"objective":objective,"operation":operation}
    if asset: item.update({"stimulusAsset":asset,"stimulusAssetAlt":alt})
    if code: item["stimulusCode"]=code
    mcqs.append(item)
for i,item in enumerate(essays,1): item.update({"id":f"M3L4-E{i:02d}","responseType":"structured response","marks":5})

def write_jsonl(name,rows):
    (ROOT/name).write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in rows)+"\n")
import sys
sys.path.insert(0, str(ROOT.parent))
from explanation_overrides import apply_overrides
apply_overrides(ROOT.name, mcqs)
write_jsonl("final_items.jsonl",mcqs); write_jsonl("essay_items.jsonl",essays)
write_jsonl("blind_mcq_review.jsonl",[{"id":x["id"],"question":x["question"],"options":x["options"],"stimulusAsset":x.get("stimulusAsset"),"stimulusAssetAlt":x.get("stimulusAssetAlt"),"stimulusCode":x.get("stimulusCode")} for x in mcqs])
write_jsonl("blind_essay_review.jsonl",[{"id":x["id"],"prompt":x["prompt"],"stimulusAsset":x.get("stimulusAsset"),"stimulusAssetAlt":x.get("stimulusAssetAlt"),"stimulusAssets":x.get("stimulusAssets"),"stimulusAssetsAlt":x.get("stimulusAssetsAlt"),"stimulusCode":x.get("stimulusCode"),"marks":5} for x in essays])

def stimulus_figures(item):
    if item.get("stimulusAsset"):
        return [(item["stimulusAsset"],item.get("stimulusAssetAlt", ""))]
    return list(zip(item.get("stimulusAssets", []),item.get("stimulusAssetsAlt", [])))

html=["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Module 3 Lesson 4 — Visualization</title>","<style>body{font:16px/1.55 system-ui,sans-serif;max-width:1000px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}figure{margin:1rem 0}img{display:block;max-width:100%;height:auto;margin:auto;border:1px solid #e1e5e9}figcaption{font-size:.88rem;color:#52647a;text-align:center}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 3 — Visualisation with pandas</h1><p>40 MCQs and 8 structured responses. Chart stimuli are original SVG illustrations; values are labeled illustrative unless explicitly identified otherwise.</p><h2>Multiple-choice questions</h2>"]
for x in mcqs:
    html.append(f"<article><h3>{x['id']}</h3><p>{escape(x['question'])}</p>")
    for asset,alt in stimulus_figures(x):
        html.append(f"<figure><img src='{escape(asset)}' alt='{escape(alt)}'><figcaption>{escape(alt)}</figcaption></figure>")
    if x.get("stimulusCode"): html.append(f"<pre><code>{escape(x['stimulusCode'])}</code></pre>")
    html.append("<ol type='A'>"+"".join(f"<li>{escape(o)}</li>" for o in x["options"])+"</ol></article>")
html.append("<h2>Structured-response questions</h2>")
for x in essays:
    html.append(f"<article><h3>{x['id']} · 5 marks</h3><p>{escape(x['prompt'])}</p>")
    for asset,alt in stimulus_figures(x):
        html.append(f"<figure><img src='{escape(asset)}' alt='{escape(alt)}'><figcaption>{escape(alt)}</figcaption></figure>")
    if x.get("stimulusCode"): html.append(f"<pre><code>{escape(x['stimulusCode'])}</code></pre>")
    html.append("</article>")
html.append("</body></html>"); (ROOT/"question_preview.html").write_text("\n".join(html))

# Mechanical checks only; the question-only packets are prepared for a later reviewer.
for x in mcqs:
    assert len(x["options"])==4 and len(set(x["options"]))==4
    assert x["options"][x["correctIndex"]]==x["expectedAnswer"]
    for asset,_ in stimulus_figures(x): assert (ROOT/asset).is_file()
for x in essays:
    assert x.get("justification") and sum(r["points"] for r in x["rubric"])==5
    assert len(x.get("stimulusAssets",[]))==len(x.get("stimulusAssetsAlt",[]))
    for asset,_ in stimulus_figures(x): assert (ROOT/asset).is_file()
key_counts=Counter(x["correctIndex"] for x in mcqs)
all_items=mcqs+essays
asset_refs={asset for item in all_items for asset,_ in stimulus_figures(item)}
aud={"mcq_count":len(mcqs),"essay_count":len(essays),"four_distinct_options_each":True,"keys_valid":True,
     "answer_positions_A_to_D":[key_counts[i] for i in range(4)],"unique_chart_assets":len(asset_refs),
     "mcqs_with_chart_stimulus":sum(bool(stimulus_figures(x)) for x in mcqs),"essays_with_chart_stimulus":sum(bool(stimulus_figures(x)) for x in essays),
     "essays_with_explicit_justification":sum(bool(x.get('justification')) for x in essays),"essay_rubric_totals":{x['id']:sum(r['points'] for r in x['rubric']) for x in essays},
     "question_preview_img_count":html and "<img" ,"review_status":"Mechanical checks complete. Question-only review packets prepared; independent blind review not performed.",
     "source_pair":"ssc/Module 3/4_visualization.md and Module 3 Lecture 3_1 PDF pp. 56–59"}
aud["question_preview_img_count"]=(ROOT/"question_preview.html").read_text().count("<img ")
aud["duplicate_stems"]=[s for s,n in Counter(re.sub(r"\W+"," ",x['question'].lower()).strip() for x in mcqs).items() if n>1]
(ROOT/"mechanical_audit.json").write_text(json.dumps(aud,ensure_ascii=False,indent=2)+"\n")
(ROOT/"charts/manifest.json").write_text(json.dumps({
 "note":"All figures exported as SVG from actual pandas, Matplotlib, or Seaborn plotting calls; values are illustrative.",
 "renderers":{"student_scores_grouped_bar.svg":"pandas.DataFrame.plot.bar","ages_histogram.svg":"pandas.Series.plot.hist","income_histogram.svg":"pandas.Series.plot.hist","passenger_class_counts_unsorted.svg":"pandas.DataFrame.plot.bar","country_category_bar.svg":"pandas.DataFrame.plot.bar","city_enrolment_horizontal.svg":"pandas.Series.plot.barh","fare_by_outcome_boxplot.svg":"seaborn.boxplot","egypt_population_line.svg":"pandas.DataFrame.plot.line","study_hours_score_scatter.svg":"pandas.DataFrame.plot.scatter","age_fare_scatter.svg":"pandas.DataFrame.plot.scatter","two_groups_scatter.svg":"seaborn.scatterplot","survey_composition_pie.svg":"pandas.Series.plot.pie","similar_shares_pie.svg":"pandas.Series.plot.pie","survival_by_class_stacked.svg":"pandas.DataFrame.plot.bar(stacked=True)"}
},ensure_ascii=False,indent=2)+"\n")
(ROOT/"lesson_plan.json").write_text(json.dumps({"lesson":"Module 3, Lesson 4: Visualisation with pandas","sources":{"primary_markdown":"ssc/Module 3/4_visualization.md","primary_pdf":"ssc/Module 3/10. Module 3_1_pandas.pdf, pp. 56–59","scope":"Plotting-library roles; pandas.plot for exploratory analysis; selecting and interpreting histograms, pie charts, bars, stacked bars, box plots, line charts, and scatter plots; bins; category ordering; chart implications and limitations."},"batch":{"mcqs":40,"structured_responses":8,"marks_each":5},"method":"Paired-source drafting; original SVG stimuli; answer-key/rubric checks; question-only packets prepared; mechanical audit. No independent blind review performed."},ensure_ascii=False,indent=2)+"\n")
(ROOT/"essay_plan.json").write_text(json.dumps({"recommendation":"8 structured responses, 5 marks each","rationale":"Essays require students to read real charts, justify chart choices, explain visual limitations, and write pandas plotting calls.","total_marks":40,"coverage":{x['id']:x['operation'] for x in essays}},ensure_ascii=False,indent=2)+"\n")
(ROOT/"review.md").write_text("""# Review status\n\nThe authoring review checked all question keys and explanations against the source lesson and rendered figures, including category ordering, histogram bins, median comparisons, and the limits of normalized charts. This review caught and corrected ambiguous wording about what a 100%-stacked bar can compare and a color-specific claim that was not supported by the plot styling. Mechanical checks verified the 40 MCQ keys and choices, balanced key positions, presence of all referenced SVG files, 8 essay justifications, and five-point rubric totals.\n\nThe question-only packets in `blind_mcq_review.jsonl` and `blind_essay_review.jsonl` are prepared for a reviewer. **No blind or independent review has been performed yet.** The same-session inspection is not a substitute for that pass.\n""")
(ROOT/"essay_review.md").write_text("""# Structured-response review status\n\nAll eight essays have expected answers, explicit justifications, and five-point rubrics. Mechanical checks confirmed that each rubric totals five marks and each referenced chart exists. Content has been inspected by the authoring assistant; an independent reviewer has not reviewed these items.\n""")
(ROOT/"variety_report.md").write_text("""# Stimulus and task variety\n\nThe bank includes 14 distinct SVG figures: 12 produced through pandas plotting calls and two through Seaborn. They cover grouped and horizontal bars, histograms, scatter plots, box plots, a line chart, pie charts, and a 100%-stacked bar. Chart stimuli are distributed across the bank, with descriptive alt text; all plotted values are illustrative. The questions test chart reading, chart selection, coding, and interpretation rather than repeating one graphic throughout. The exact renderer for each image is listed in `charts/manifest.json`.\n""")
(ROOT/"source_review.md").write_text("""# Paired-source notes\n\n- Matched `4_visualization.md` to Module 3 Lecture 3_1 PDF slides 56–59. The batch covers the library roles, pandas.plot purpose, chart-type table, and the student-score bar-chart example.\n- The broader Titanic data charts on PDF slides 64–65 belong to Lesson 5 and are excluded. Chart data here are explicitly illustrative, not presented as recovered or historical Titanic values.\n- The PDF chart-functions slide lists `barh`, `area`, and a default plot in addition to the types in the Markdown. These aren't assessed as lesson objectives because the Markdown's chart-selection table does not explain them.\n- All SVG charts are original teaching stimuli. Numeric labels and alt text make the required evidence available; each asset is attached directly to the questions that depend on it.\n""")
(ROOT/"README.md").write_text("""# Module 3 Lesson 4 pilot — Visualisation with pandas\n\nContains 40 MCQs and 8 structured responses worth 5 marks each. Sources: `ssc/Module 3/4_visualization.md` and corresponding PDF slides 56–59. The `charts/` directory contains 14 original SVG figures generated with pandas/Matplotlib and Seaborn plotting calls.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing items with explanations, justifications, and rubrics.\n- `question_preview.html`: rendered questions with the actual chart files and code.\n- `charts/`: chart files and a renderer manifest.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`: question-only packets prepared for later review; no blind audit is claimed.\n- `mechanical_audit.json`, `review.md`, `essay_review.md`, `source_review.md`, and plans: checks and source scope.\n\nThe answer-bearing draft was checked by the authoring assistant, but has not received independent or blind review.\n""")
print(json.dumps(aud,ensure_ascii=False,indent=2))
