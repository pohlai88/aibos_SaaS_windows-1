import request from 'supertest';
import express from 'express';
import { IntercompanyTransfer } from '../../types/intercompany';
import app from '../index';

describe('POST /api/transfers', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .send({ fromEntity: 'A', toEntity: 'B', amount: 100, currency: 'USD' });
    expect(res.status).toBe(401);
  });
});
