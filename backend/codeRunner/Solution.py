t=int(input());
while t>0:
    t-=1;
    inputs=[int(i) for i in input().split(" ")];
    sum=0;
    n=inputs[0];
    while n>0:
        sum+=inputs[inputs[0]-n+1];
        n-=1;
    print(sum);