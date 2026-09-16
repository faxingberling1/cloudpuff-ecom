import { NextResponse } from 'next/server';
import { pool, initDb, SavedPaymentMethodRow } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user_arsalan';

    const res = await pool.query(
      `SELECT * FROM saved_payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC;`,
      [userId]
    );

    const methods = res.rows.map((row: SavedPaymentMethodRow) => ({
      id: row.id,
      brand: row.card_nickname || row.brand,
      cardholderName: row.cardholder_name,
      last4: row.last4,
      exp: row.exp,
      isDefault: row.is_default,
      icon: row.icon,
      rawBrand: row.brand,
    }));

    return NextResponse.json({ success: true, methods });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const {
      brand,
      cardholderName,
      last4,
      exp,
      isDefault = false,
      icon = '💳',
      cardNickname,
      userId = 'user_arsalan',
    } = body;

    if (!brand || !last4 || !exp) {
      return NextResponse.json(
        { success: false, error: 'Missing required card fields' },
        { status: 400 }
      );
    }

    const cardId = `card-${Date.now()}`;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // If set as default, mark others as false
      if (isDefault) {
        await client.query(
          `UPDATE saved_payment_methods SET is_default = FALSE WHERE user_id = $1;`,
          [userId]
        );
      }

      const insertRes = await client.query(
        `INSERT INTO saved_payment_methods
          (id, user_id, brand, cardholder_name, last4, exp, is_default, icon, card_nickname)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *;`,
        [
          cardId,
          userId,
          brand,
          cardholderName || 'Verified Cloud Parent',
          last4,
          exp,
          isDefault,
          icon,
          cardNickname || brand,
        ]
      );

      await client.query('COMMIT');

      const row = insertRes.rows[0];
      return NextResponse.json({
        success: true,
        method: {
          id: row.id,
          brand: row.card_nickname || row.brand,
          cardholderName: row.cardholder_name,
          last4: row.last4,
          exp: row.exp,
          isDefault: row.is_default,
          icon: row.icon,
          rawBrand: row.brand,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const { id, action, cardNickname, exp, userId = 'user_arsalan' } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Card ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (action === 'set_default') {
        // Set all to false
        await client.query(
          `UPDATE saved_payment_methods SET is_default = FALSE, updated_at = NOW() WHERE user_id = $1;`,
          [userId]
        );
        // Set chosen one to true
        await client.query(
          `UPDATE saved_payment_methods SET is_default = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2;`,
          [id, userId]
        );
      } else if (action === 'update_card') {
        if (cardNickname && exp) {
          await client.query(
            `UPDATE saved_payment_methods
             SET card_nickname = $1, exp = $2, updated_at = NOW()
             WHERE id = $3 AND user_id = $4;`,
            [cardNickname, exp, id, userId]
          );
        } else if (cardNickname) {
          await client.query(
            `UPDATE saved_payment_methods
             SET card_nickname = $1, updated_at = NOW()
             WHERE id = $2 AND user_id = $3;`,
            [cardNickname, id, userId]
          );
        } else if (exp) {
          await client.query(
            `UPDATE saved_payment_methods
             SET exp = $1, updated_at = NOW()
             WHERE id = $2 AND user_id = $3;`,
            [exp, id, userId]
          );
        }
      }

      await client.query('COMMIT');

      // Return updated list
      const res = await client.query(
        `SELECT * FROM saved_payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC;`,
        [userId]
      );

      const methods = res.rows.map((row: SavedPaymentMethodRow) => ({
        id: row.id,
        brand: row.card_nickname || row.brand,
        cardholderName: row.cardholder_name,
        last4: row.last4,
        exp: row.exp,
        isDefault: row.is_default,
        icon: row.icon,
        rawBrand: row.brand,
      }));

      return NextResponse.json({ success: true, methods });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user_arsalan';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Card ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if this card is currently default
      const checkRes = await client.query(
        `SELECT is_default FROM saved_payment_methods WHERE id = $1 AND user_id = $2;`,
        [id, userId]
      );

      if (checkRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Payment method not found' },
          { status: 404 }
        );
      }

      // Default Method / Primary card cannot be removed
      if (checkRes.rows[0].is_default) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: 'Default Method / Primary card cannot be removed. Please designate another card as default first.',
          },
          { status: 400 }
        );
      }

      // Delete the card
      await client.query(
        `DELETE FROM saved_payment_methods WHERE id = $1 AND user_id = $2;`,
        [id, userId]
      );

      await client.query('COMMIT');

      // Return remaining cards
      const res = await client.query(
        `SELECT * FROM saved_payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC;`,
        [userId]
      );

      const methods = res.rows.map((row: SavedPaymentMethodRow) => ({
        id: row.id,
        brand: row.card_nickname || row.brand,
        cardholderName: row.cardholder_name,
        last4: row.last4,
        exp: row.exp,
        isDefault: row.is_default,
        icon: row.icon,
        rawBrand: row.brand,
      }));

      return NextResponse.json({ success: true, methods });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error removing payment method:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
