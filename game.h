#define EMPTY 0
#define RED 1
#define GREEN 2
#define RGSWITCH 5
#define SKEY 6
#define GKEY 7
#define SKEYHOLE 8
#define GKEYHOLE 9
#define MOVEBLOCK 10
#define MOVEHOLE 11
#define GOAL 12
#define SOLIDBLOCK 13

int GetGKeys();

int GetSKeys();

char GetDisplayF(int*);

char Init(int);

char Move(int, int);

void Mix();

void Done();
