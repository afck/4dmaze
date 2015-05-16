#include "game.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

static int x[4], l[4];
static char red;
static char *f;
static int skeys, gkeys;

void Norm(int p[4]) {
  int j;
  for (j = 0; j < 4; j++) {
    while (p[j] < 0) p[j] += l[j];
    p[j] %= l[j];
  }
}

void SetF(int p[4], char type) {
  f[p[0] + l[0] * p[1] + l[0] * l[1] * p[2] + l[0] * l[1] * l[2] * p[3]] = type;
}

char GetF(int p[4]) {
  return f[p[0] + l[0] * p[1] + l[0] * l[1] * p[2] + l[0] * l[1] * l[2] * p[3]];
}

int GetSKeys() { return skeys; }

int GetGKeys() { return gkeys; }

char GetDisplayF(int p[4]) {
  char type;
  int q[4], j;
  for (j = 0; j < 4; j++) q[j] = p[j] + x[j] - 2;
  Norm(q);
  type = GetF(q);
  if (type == RED && !red)
    type += 2;
  else if (type == GREEN && red)
    type += 2;
  return type;
}

char Init(int fileNr) {
  char fileName[12];
  sprintf(fileName, "mazes/%i.txt", fileNr);
  srand(time(0));
  int i[4], j;
  red = 1;
  skeys = 0;
  gkeys = 0;
  char c[3] = {1, 1, 1};
  for (j = 0; j < 4; j++) l[j] = 0;
  FILE *file = fopen(fileName, "r");
  if (file == 0) return 0;
  while (j != EOF) {
    j = getc(file);
    if (j == '+') {
      c[0] = 0;
      if (c[1]) l[1]++;
    } else if (j == '\n') {
      c[1] = 0;
      if (c[2]) l[2]++;
      j = getc(file);
      if (j == '+') {
        c[2] = 0;
        l[3]++;
      } else
        ungetc(j, file);
    }
    if (c[0]) l[0]++;
  }
  f = (char *)malloc(sizeof(char[l[0] * l[1] * l[2] * l[3]]));
  if (f == 0) return 0;
  fclose(file);
  file = fopen(fileName, "r");
  for (i[3] = 0; i[3] < l[3]; i[3]++)
    for (i[2] = 0; i[2] < l[2]; i[2]++)
      for (i[1] = 0; i[1] < l[1]; i[1]++)
        for (i[0] = 0; i[0] < l[0]; i[0]++) {
          j = getc(file);
          if (j >= '0' && j <= '9')
            SetF(i, SOLIDBLOCK + j - '0');
          else if (j == 'k')
            SetF(i, SKEY);
          else if (j == 'K')
            SetF(i, GKEY);
          else if (j == 'h')
            SetF(i, SKEYHOLE);
          else if (j == 'H')
            SetF(i, GKEYHOLE);
          else if (j == 'r')
            SetF(i, RED);
          else if (j == 'g')
            SetF(i, GREEN);
          else if (j == 's')
            SetF(i, RGSWITCH);
          else if (j == 'S') {
            SetF(i, EMPTY);
            for (j = 0; j < 4; j++) x[j] = i[j];
          } else if (j == 'b')
            SetF(i, MOVEBLOCK);
          else if (j == 'B')
            SetF(i, MOVEHOLE);
          else if (j == 'G')
            SetF(i, GOAL);
          else if (j == ' ')
            SetF(i, EMPTY);
          else if (j == EOF) {
            Done();
            return 0;
          } else
            i[0]--;
        }
  fclose(file);
  return 1;
}

char Move(int dim, int dir) {
  char type;
  x[dim] += dir;
  Norm(x);
  type = GetF(x);
  if (type == EMPTY || (type == RED && red) || (type == GREEN && !red))
    return 1;
  if (type == GOAL) {
    return 0;
  }
  if (type == SKEYHOLE && skeys > 0) {
    skeys--;
    SetF(x, EMPTY);
    return 1;
  }
  if (type == GKEYHOLE && gkeys > 0) {
    gkeys--;
    SetF(x, EMPTY);
    return 1;
  }
  if (type == SKEY) {
    skeys++;
    SetF(x, EMPTY);
    return 1;
  }
  if (type == GKEY) {
    gkeys++;
    SetF(x, EMPTY);
    return 1;
  }
  if (type == RGSWITCH) {
    red = !red;
    return 1;
  }
  if (type == MOVEBLOCK) {
    x[dim] += dir;
    Norm(x);
    if (GetF(x) == EMPTY) {
      SetF(x, MOVEBLOCK);
      x[dim] -= dir;
      Norm(x);
      SetF(x, EMPTY);
      return 1;
    }
    if (GetF(x) == MOVEHOLE) {
      SetF(x, EMPTY);
      x[dim] -= dir;
      Norm(x);
      SetF(x, EMPTY);
      return 1;
    }
    x[dim] -= dir;
    Norm(x);
  }
  x[dim] -= dir;
  Norm(x);
  return 1;
}

void Mix() {
  char *nf;
  int j, i[4], ln[4], xn[4], n[4] = {0, 1, 2, 3}, d[4];
  for (j = 0; j < 12; j++) {
    i[0] = rand() % 4;
    i[1] = rand() % 4;
    i[2] = n[i[0]];
    n[i[0]] = n[i[1]];
    n[i[1]] = i[2];
  }
  nf = malloc(l[0] * l[1] * l[2] * l[3] * sizeof(char));
  for (j = 0; j < 4; j++) d[j] = rand() % 2;
  for (j = 0; j < 4; j++) {
    ln[j] = l[n[j]];
    xn[j] = x[n[j]] + (ln[j] - 2 * x[n[j]] - 1) * d[j];
  }
  for (i[3] = 0; i[3] < l[3]; i[3]++)
    for (i[2] = 0; i[2] < l[2]; i[2]++)
      for (i[1] = 0; i[1] < l[1]; i[1]++)
        for (i[0] = 0; i[0] < l[0]; i[0]++)
          nf[i[n[0]] + (ln[0] - 2 * i[n[0]] - 1) * d[0] +
             +ln[0] * (i[n[1]] + (ln[1] - 2 * i[n[1]] - 1) * d[1]) +
             +ln[0] * ln[1] * (i[n[2]] + (ln[2] - 2 * i[n[2]] - 1) * d[2]) +
             +ln[0] * ln[1] * ln[2] *
                 (i[n[3]] + (ln[3] - 2 * i[n[3]] - 1) * d[3])] = GetF(i);
  for (j = 0; j < 4; j++) {
    l[j] = ln[j];
    x[j] = xn[j];
  }
  free(f);
  f = nf;
}

void Done() { free(f); }
