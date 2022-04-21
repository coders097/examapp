class A:
    def __init__(self,var):
        self.var = var
    def __str__(self):
        return str(self.var)

A=A(1);
print(A);
delattr(a,'temp');